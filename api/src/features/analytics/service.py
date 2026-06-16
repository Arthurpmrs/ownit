from sqlalchemy import Connection, insert, select

from src.core.logger import get_logger
from src.features.study_session.tables import study_sessions
from src.shared.schemas import EventResponse

from .exceptions import EventNotFountError
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


def create_comment(conn: Connection, data: EventCreate) -> EventResponse:
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
        .returning(events)
    )

    event_row = conn.execute(stmt).fetchone()

    if event_row is None:
        raise EventNotFountError(
            data.goal_id or '', data.study_session_id or '', data.type
        )

    return EventResponse(**event_row._mapping)


def get_study_session_history(
    conn: Connection, student_id: int, study_session_id: str
) -> list[EventResponse]:
    stmt = (
        select(events)
        .where(
            events.c.student_id == student_id,
            events.c.study_session_id == study_session_id,
        )
        .order_by(events.c.timestamp.asc())
    )

    rows = conn.execute(stmt).fetchall()

    return [EventResponse(**row._mapping) for row in rows]
