from uuid import uuid4

from sqlalchemy import insert, select
from sqlalchemy.engine import Connection

from src.core.logger import get_logger
from src.features.goal.tables import goals

from .schemas import StudySessionCreate, StudySessionResponse, StudySessionShortResponse
from .tables import study_sessions

logger = get_logger(__name__)


def _row_to_schema(row) -> StudySessionResponse:
    return StudySessionResponse(**row._mapping)


def goal_exists_by_id(conn: Connection, goal_id: str) -> bool:
    stmt = select(goals).where(goals.c.id == goal_id)
    return bool(conn.scalar(stmt))


def create_study_session(
    conn: Connection, student_id: int, payload: StudySessionCreate
) -> StudySessionResponse:
    goal_id = payload.goal_id
    logger.info(f'Creating StudySession for goal_id={goal_id} & student_id={student_id}')

    if not goal_exists_by_id(conn, goal_id):
        logger.warning(f'Goal not found: {goal_id}')
        raise Exception('Goal does not exist!')

    study_session_id = str(uuid4())

    stmt = insert(study_sessions).values(
        id=study_session_id,
        student_id=student_id,
        goal_id=goal_id,
        title=payload.title,
        description=payload.description,
        planned_to_start_at=payload.planned_to_start_at,
        duration=payload.duration,
        focus_mode_duration=payload.focus_mode_duration,
        pause_mode_duration=payload.pause_mode_duration,
    )

    conn.execute(stmt)

    logger.info(f'StudySession created with id={study_session_id}')

    study_session = get_study_session(conn, student_id, study_session_id)

    if not study_session:
        logger.warning(f'StudySession not found: {study_session_id}')
        raise Exception('StudySession does not exist! Something went wrong.')

    return study_session


def get_study_session(
    conn: Connection, student_id: int, study_session_id: str
) -> StudySessionResponse | None:
    stmt = (
        select(
            *study_sessions.c,
            (study_sessions.c.planned_to_start_at + study_sessions.c.duration).label(
                'planned_to_end_at'
            ),
            goals.c.title.label('goal_title'),
        )
        .join(goals, study_sessions.c.goal_id == goals.c.id)
        .where(
            study_sessions.c.id == study_session_id,
            study_sessions.c.student_id == student_id,
        )
    )

    result = conn.execute(stmt).fetchone()

    return _row_to_schema(result) if result else None


def get_goal_study_sessions(
    conn: Connection, student_id: int, goal_id: str
) -> list[StudySessionShortResponse]:
    stmt = select(
        *study_sessions.c,
        (study_sessions.c.planned_to_start_at + study_sessions.c.duration).label(
            'planned_to_end_at'
        ),
    ).where(
        study_sessions.c.goal_id == goal_id, study_sessions.c.student_id == student_id
    )
    sessions = conn.execute(stmt).fetchall()

    return [StudySessionShortResponse(**session._mapping) for session in sessions]
