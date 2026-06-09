from sqlalchemy import Connection, insert

from src.core.logger import get_logger

from .schemas import EventCreate
from .tables import events

logger = get_logger(__name__)


def create_event(conn: Connection, data: EventCreate):
    try:
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
