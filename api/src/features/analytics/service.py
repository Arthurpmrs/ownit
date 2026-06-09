from sqlalchemy import Connection, insert, select

from src.core.logger import get_logger
from src.features.study_session.tables import study_sessions

from .schemas import EventCreate
from .tables import events

logger = get_logger(__name__)


def _get_goal_id(conn: Connection, student_id: int, study_session_id: str) -> str | None:
    return conn.scalar(
        select(study_sessions.c.goal_id).where(
            study_sessions.c.id == study_session_id,
            study_sessions.c.student_id == student_id,
        )
    )


def create_event(conn: Connection, data: EventCreate):
    try:
        if data.study_session_id and not data.goal_id:
            data.goal_id = _get_goal_id(conn, data.student_id, data.study_session_id)

        stmt = (
            insert(events)
            .values(
                type=data.type,
                student_id=data.student_id,
                goal_id=data.goal_id,
                study_session_id=data.study_session_id,
                context=data.context,
            )
            .returning(events.c.timestamp)
        )

        timestamp = conn.scalar(stmt)

        logger.info(
            f'Registered event {data.type} for student {data.student_id} on {timestamp}.'
        )
    except Exception as e:
        logger.exception(
            f'Failed to register event {data.type} for student {data.student_id}!: '
            f'{str(e)}'
        )
