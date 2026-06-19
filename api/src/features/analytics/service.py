from collections import defaultdict
from datetime import datetime
from math import floor

from sqlalchemy import Connection, insert, select

from src.core.logger import get_logger
from src.features.goal.tables import goals
from src.features.study_session.tables import study_sessions
from src.shared.schemas import EventResponse, Status

from .exceptions import EventNotFountError
from .schemas import EventCreate
from .tables import EventType, events

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


def get_strategy_metrics(
    conn: Connection, student_id: int, goal_id: str
) -> dict[str, dict]:
    """
    Calcula aderência e atraso por estratégia para um goal.

    Aderência: 1 - (|planned_duration - real_duration| / planned_duration)
    Atraso: diferença entre planned_to_start_at e STUDY_SESSION_STARTED (em minutos)
    """

    # Buscar todos os eventos START e FINISH de uma study session do goal
    started_events = (
        select(
            events.c.study_session_id,
            events.c.timestamp.label('started_at'),
        )
        .where(
            events.c.student_id == student_id,
            events.c.goal_id == goal_id,
            events.c.type == EventType.STUDY_SESSION_STARTED,
        )
        .subquery()
    )

    finished_events = (
        select(
            events.c.study_session_id,
            events.c.timestamp.label('finished_at'),
        )
        .where(
            events.c.student_id == student_id,
            events.c.goal_id == goal_id,
            events.c.type == EventType.STUDY_SESSION_FINISHED,
        )
        .subquery()
    )

    # Juntar com study sessions para pegar planned_to_start_at, duration e strategies
    stmt = (
        select(
            study_sessions.c.strategies,
            study_sessions.c.planned_to_start_at,
            study_sessions.c.duration.label('planned_duration'),
            started_events.c.started_at,
            finished_events.c.finished_at,
        )
        .join(
            started_events,
            study_sessions.c.id == started_events.c.study_session_id,
            isouter=True,
        )
        .join(
            finished_events,
            study_sessions.c.id == finished_events.c.study_session_id,
            isouter=True,
        )
        .where(
            study_sessions.c.student_id == student_id,
            study_sessions.c.goal_id == goal_id,
            study_sessions.c.status == Status.done,
        )
    )

    rows = conn.execute(stmt).fetchall()

    # Agregar por estratégia
    strategy_data: dict[str, list[dict]] = {}

    for row in rows:
        strategies = row.strategies or []
        started_at = row.started_at
        finished_at = row.finished_at

        if not strategies or not started_at or not finished_at:
            continue

        # Calcular aderência
        real_duration = finished_at - started_at
        planned_duration = row.planned_duration
        adherence = 1 - (abs(real_duration - planned_duration) / planned_duration)
        adherence = max(0, min(1, adherence))  # limitar entre 0 e 1

        for strategy in strategies:
            if strategy not in strategy_data:
                strategy_data[strategy] = []

            strategy_data[strategy].append({'adherence': adherence})

    # Calcular média por estratégia
    result = {}

    for strategy, metrics in strategy_data.items():
        avg_adherence = sum(m['adherence'] for m in metrics) / len(metrics)

        result[strategy] = {
            'adherence': round(avg_adherence, 2),
            'sessions_count': len(metrics),
        }

    return result


def get_week_number(
    timestamp: datetime,
    starting_timestamp: datetime,
) -> int:
    delta_seconds = (timestamp - starting_timestamp).total_seconds()

    return floor(delta_seconds / (7 * 24 * 60 * 60)) + 1


def get_self_regulation_metrics(
    conn: Connection,
    student_id: int,
    goal_id: str,
) -> list[dict]:
    goal_status = conn.scalar(select(goals.c.status).where(goals.c.id == goal_id))

    if goal_status is None or goal_status != 'doing':
        raise RuntimeError('Goal is not started')

    goal_started_timestamp = conn.scalar(
        select(events.c.timestamp).where(
            events.c.goal_id == goal_id,
            events.c.type == EventType.GOAL_EDITED,
        )
    )

    if goal_started_timestamp is None:
        raise RuntimeError('something went wrong')

    sr_event_rows = conn.execute(
        select(events.c.timestamp).where(
            events.c.student_id == student_id,
            events.c.goal_id == goal_id,
            events.c.type.in_([
                EventType.STUDY_SESSION_CREATED,
                EventType.STUDY_SESSION_UPDATED,
                EventType.STUDY_SESSION_CANCELED,
            ]),
            events.c.context['goal_status'].astext == 'doing',
        )
    ).fetchall()

    finished_event_rows = conn.execute(
        select(events.c.timestamp).where(
            events.c.student_id == student_id,
            events.c.goal_id == goal_id,
            events.c.type == EventType.STUDY_SESSION_FINISHED,
        )
    ).fetchall()

    sr_events_per_week = defaultdict(int)

    for row in sr_event_rows:
        week = get_week_number(
            row.timestamp,
            goal_started_timestamp,
        )

        sr_events_per_week[week] += 1

    finished_sessions_per_week = defaultdict(int)

    for row in finished_event_rows:
        week = get_week_number(
            row.timestamp,
            goal_started_timestamp,
        )

        finished_sessions_per_week[week] += 1

    weeks = sorted(set(sr_events_per_week) | set(finished_sessions_per_week))

    frequency_per_week = []

    for week in weeks:
        sr_count = sr_events_per_week[week]
        finished_count = finished_sessions_per_week[week]

        frequency = sr_count / finished_count if finished_count > 0 else 0

        frequency_per_week.append({
            'week': week,
            'sr_count': sr_count,
            'finished_count': finished_count,
            'frequency': frequency,
        })

    return frequency_per_week
