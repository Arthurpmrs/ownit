from datetime import UTC, datetime, timedelta
from uuid import uuid4

from sqlalchemy import exists, func, insert, select, update
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from src.core.logger import get_logger
from src.core.state_machine import PomodoroStateMachine, StudySessionStateMachine
from src.features.goal.exceptions import GoalNotFoundError
from src.features.goal.tables import goals
from src.shared.schemas import Status, StudySessionShortResponse

from .exceptions import (
    ActiveSessionExistsError,
    InvalidPomodoroTransitionError,
    InvalidTransitionError,
    PomodoroNotFoundError,
    StudySessionNotFoundError,
    WrongStudySessionStateError,
)
from .schemas import (
    PomodoroResponse,
    PomodoroStateChangeData,
    StudySessionCreate,
    StudySessionEvaluate,
    StudySessionNotesUpdate,
    StudySessionResponse,
)
from .tables import PomodoroStatus, study_session_pomodoros, study_sessions

logger = get_logger(__name__)


def _get_study_session_predicate(study_session_id: str, student_id: int):
    return (
        study_sessions.c.id == study_session_id,
        study_sessions.c.student_id == student_id,
    )


def _row_to_schema(row, pomodoro_row) -> StudySessionResponse:
    pomodoro = PomodoroResponse(**pomodoro_row._mapping) if pomodoro_row else None
    return StudySessionResponse(**row._mapping, pomodoro=pomodoro)


def goal_exists_by_id(conn: Connection, goal_id: str) -> bool:
    stmt = select(exists().where(goals.c.id == goal_id))
    return bool(conn.scalar(stmt))


def create_pomodoro(conn: Connection, study_session_id: str):
    stmt = insert(study_session_pomodoros).values(
        study_session_id=study_session_id,
        state_started_at=func.now(),
        state_remaining_duration=timedelta(0),
        status=PomodoroStatus.not_started,
    )

    conn.execute(stmt)

    logger.info(f'Pomodoro created for StudySession({study_session_id})')


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

    if payload.focus_mode_duration and payload.pause_mode_duration:
        create_pomodoro(conn, study_session_id)

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

    pomodoro_result = conn.execute(
        select(study_session_pomodoros).where(
            study_session_pomodoros.c.study_session_id == study_session_id
        )
    ).fetchone()

    return _row_to_schema(result, pomodoro_result)


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


def _calculate_remaining_duration(
    now: datetime, pomodoro: PomodoroStateChangeData, new_status: PomodoroStatus
) -> timedelta:
    match pomodoro.status, new_status:
        case PomodoroStatus.not_started, PomodoroStatus.focus_mode:
            duration = pomodoro.focus_duration
        case PomodoroStatus.focus_mode, PomodoroStatus.break_mode:
            duration = pomodoro.break_duration
        case PomodoroStatus.break_mode, PomodoroStatus.focus_mode:
            duration = pomodoro.focus_duration
        case (PomodoroStatus.focus_mode, PomodoroStatus.focus_pause) | (
            PomodoroStatus.break_mode,
            PomodoroStatus.break_pause,
        ):
            elapsed = now - pomodoro.state_started_at
            duration = max(timedelta(0), pomodoro.state_remaining_duration - elapsed)
        case (PomodoroStatus.focus_pause, PomodoroStatus.focus_mode) | (
            PomodoroStatus.break_pause,
            PomodoroStatus.break_mode,
        ):
            duration = pomodoro.state_remaining_duration
        case _, PomodoroStatus.not_started | PomodoroStatus.done:
            duration = timedelta(0)
        case _:
            raise RuntimeError(f'Unhandled transition: {pomodoro.status} -> {new_status}')

    return duration


def update_pomodoro_state(
    conn: Connection,
    student_id: int,
    study_session_id: str,
    new_status: PomodoroStatus,
) -> PomodoroResponse:
    pomodoro_row = conn.execute(
        select(
            study_session_pomodoros,
            study_sessions.c.focus_mode_duration.label('focus_duration'),
            study_sessions.c.pause_mode_duration.label('break_duration'),
        )
        .join(
            study_sessions,
            study_session_pomodoros.c.study_session_id == study_sessions.c.id,
        )
        .where(
            study_session_pomodoros.c.study_session_id == study_session_id,
            study_sessions.c.student_id == student_id,
        )
    ).fetchone()

    if not pomodoro_row:
        raise PomodoroNotFoundError(study_session_id)

    pomodoro = PomodoroStateChangeData(**pomodoro_row._mapping)

    if not PomodoroStateMachine.can_transition(pomodoro.status, new_status):
        raise InvalidPomodoroTransitionError(
            study_session_id, pomodoro.status, new_status
        )

    now = datetime.now(UTC)
    duration = _calculate_remaining_duration(now, pomodoro, new_status)

    stmt = (
        update(study_session_pomodoros)
        .where(study_session_pomodoros.c.id == pomodoro.id)
        .values(
            state_started_at=now,
            state_remaining_duration=duration,
            status=new_status,
        )
        .returning(study_session_pomodoros)
    )

    updated_row = conn.execute(stmt).fetchone()

    if not updated_row:
        raise PomodoroNotFoundError(study_session_id)

    return PomodoroResponse(**updated_row._mapping)
