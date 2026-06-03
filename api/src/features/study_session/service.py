from uuid import uuid4

from sqlalchemy import exists, func, insert, select, update
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from src.core.logger import get_logger
from src.core.state_machine import StudySessionStateMachine
from src.features.goal.exceptions import GoalNotFoundError
from src.features.goal.tables import goals
from src.shared.schemas import Status, StudySessionShortResponse

from .exceptions import (
    ActiveSessionExistsError,
    InvalidTransitionError,
    StudySessionNotFoundError,
    WrongStudySessionStateError,
)
from .schemas import (
    StudySessionCreate,
    StudySessionEvaluate,
    StudySessionNotesUpdate,
    StudySessionResponse,
)
from .tables import study_sessions

logger = get_logger(__name__)


def _get_study_session_predicate(study_session_id: str, student_id: int):
    return (
        study_sessions.c.id == study_session_id,
        study_sessions.c.student_id == student_id,
    )


def _row_to_schema(row) -> StudySessionResponse:
    return StudySessionResponse(**row._mapping)


def goal_exists_by_id(conn: Connection, goal_id: str) -> bool:
    stmt = select(exists().where(goals.c.id == goal_id))
    return bool(conn.scalar(stmt))


def create_study_session(
    conn: Connection, student_id: int, payload: StudySessionCreate
) -> StudySessionResponse:
    goal_id = payload.goal_id

    logger.info(f'Creating StudySession for goal_id={goal_id} & student_id={student_id}')

    if not goal_exists_by_id(conn, goal_id):
        raise GoalNotFoundError(goal_id)

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

    return get_study_session(conn, student_id, study_session_id)


def get_study_session(
    conn: Connection, student_id: int, study_session_id: str
) -> StudySessionResponse:
    stmt = (
        select(
            *study_sessions.c,
            (study_sessions.c.planned_to_start_at + study_sessions.c.duration).label(
                'planned_to_end_at'
            ),
            goals.c.title.label('goal_title'),
        )
        .join(goals, study_sessions.c.goal_id == goals.c.id)
        .where(*_get_study_session_predicate(study_session_id, student_id))
    )

    result = conn.execute(stmt).fetchone()

    if not result:
        raise StudySessionNotFoundError(study_session_id)

    return _row_to_schema(result)


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


def _get_study_session_status(
    conn: Connection, study_session_id: str, student_id: int
) -> Status:
    status = conn.scalar(
        select(study_sessions.c.status).where(
            *_get_study_session_predicate(study_session_id, student_id)
        )
    )

    if not status:
        raise StudySessionNotFoundError(study_session_id)

    return status


def update_study_session_status(
    conn: Connection,
    student_id: int,
    study_session_id: str,
    new_status: Status,
) -> StudySessionResponse:
    current_status = _get_study_session_status(conn, study_session_id, student_id)

    if not StudySessionStateMachine.can_transition(current_status, new_status):
        raise InvalidTransitionError(study_session_id, current_status, new_status)

    if new_status == Status.doing:
        doing_session_exists = conn.scalar(
            select(
                exists().where(
                    study_sessions.c.student_id == student_id,
                    study_sessions.c.status == Status.doing,
                )
            )
        )

        if doing_session_exists:
            raise ActiveSessionExistsError(study_session_id)

    stmt = (
        update(study_sessions)
        .where(*_get_study_session_predicate(study_session_id, student_id))
        .values(
            status=new_status,
            updated_at=func.now(),
        )
    )

    try:
        conn.execute(stmt)
    except IntegrityError as e:
        raise ActiveSessionExistsError(study_session_id) from e

    return get_study_session(conn, student_id, study_session_id)


def evaluate_study_session(
    conn: Connection,
    student_id: int,
    study_session_id: str,
    payload: StudySessionEvaluate,
) -> StudySessionResponse:
    status = _get_study_session_status(conn, study_session_id, student_id)

    if status != Status.done:
        raise WrongStudySessionStateError(study_session_id)

    stmt = (
        update(study_sessions)
        .where(*_get_study_session_predicate(study_session_id, student_id))
        .values(
            rating=payload.rating,
            domain_perception_level=payload.domain_perception_level,
            learning_difficulty_level=payload.learning_difficulty_level,
            strategies=payload.strategies,
            final_comment=payload.final_comment
            if payload.final_comment is not None
            else '',
            updated_at=func.now(),
        )
    )

    conn.execute(stmt)

    return get_study_session(conn, student_id, study_session_id)


def update_study_session_notes(
    conn: Connection,
    student_id: int,
    study_session_id: str,
    payload: StudySessionNotesUpdate,
) -> StudySessionResponse:
    stmt = (
        update(study_sessions)
        .where(*_get_study_session_predicate(study_session_id, student_id))
        .values(
            notes=payload.new_notes,
            updated_at=func.now(),
        )
    )

    conn.execute(stmt)

    return get_study_session(conn, student_id, study_session_id)
