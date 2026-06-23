from datetime import datetime, timedelta, timezone

from sqlalchemy import Connection, and_, desc, select

from src.features.analytics.tables import EventType, events
from src.features.goal.tables import goals
from src.features.study_session.tables import study_session_pomodoros, study_sessions
from src.shared.schemas import Status


def get_recent_sessions(
    conn: Connection, student_id: int, days: int = 7, limit: int = 10
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    query = (
        select(
            study_sessions,
            goals.c.title.label('goal_title'),
        )
        .select_from(study_sessions.join(goals, study_sessions.c.goal_id == goals.c.id))
        .where(
            and_(
                study_sessions.c.student_id == student_id,
                study_sessions.c.status.in_(['done', 'canceled']),
                study_sessions.c.planned_to_start_at >= cutoff,
            )
        )
        .order_by(desc(study_sessions.c.planned_to_start_at))
        .limit(limit)
    )
    return conn.execute(query).mappings().all()


def get_active_doing_session(conn: Connection, student_id: int):
    query = (
        select(
            study_sessions,
            goals.c.title.label('goal_title'),
            study_session_pomodoros.c.status.label('pomodoro_status'),
            study_session_pomodoros.c.current_remaining_duration,
            study_session_pomodoros.c.current_started_at,
        )
        .select_from(
            study_sessions.join(goals, study_sessions.c.goal_id == goals.c.id).outerjoin(
                study_session_pomodoros,
                study_sessions.c.id == study_session_pomodoros.c.study_session_id,
            )
        )
        .where(
            and_(
                study_sessions.c.student_id == student_id,
                study_sessions.c.status == 'doing',
            )
        )
    )
    return conn.execute(query).mappings().first()


def get_upcoming_sessions(conn: Connection, student_id: int, limit: int = 5):
    query = (
        select(
            study_sessions,
            goals.c.title.label('goal_title'),
        )
        .select_from(study_sessions.join(goals, study_sessions.c.goal_id == goals.c.id))
        .where(
            and_(
                study_sessions.c.student_id == student_id,
                study_sessions.c.status == 'todo',
                study_sessions.c.planned_to_start_at > datetime.now(timezone.utc),
            )
        )
        .order_by(study_sessions.c.planned_to_start_at.asc())
        .limit(limit)
    )
    return conn.execute(query).mappings().all()


def get_recent_events(conn: Connection, student_id: int, limit: int = 10):
    query = (
        select(events)
        .where(events.c.student_id == student_id)
        .order_by(desc(events.c.timestamp))
        .limit(limit)
    )
    return conn.execute(query).mappings().all()


def get_goals_strategy_metrics(
    conn: Connection, student_id: int, goal_ids: list[str]
) -> dict[str, dict[str, dict]]:
    if not goal_ids:
        return {}

    started_events = (
        select(
            events.c.study_session_id,
            events.c.timestamp.label('started_at'),
        )
        .where(
            events.c.student_id == student_id,
            events.c.goal_id.in_(goal_ids),
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
            events.c.goal_id.in_(goal_ids),
            events.c.type == EventType.STUDY_SESSION_FINISHED,
        )
        .subquery()
    )

    stmt = (
        select(
            study_sessions.c.goal_id,
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
            study_sessions.c.goal_id.in_(goal_ids),
            study_sessions.c.status == Status.done,
        )
    )

    rows = conn.execute(stmt).fetchall()

    goal_strategy_data: dict[str, dict[str, list[dict]]] = {}
    for gid in goal_ids:
        goal_strategy_data[gid] = {}

    for row in rows:
        strategies = row.strategies or []
        started_at = row.started_at
        finished_at = row.finished_at
        goal_id = row.goal_id

        if not strategies or not started_at or not finished_at:
            continue

        real_duration = finished_at - started_at
        planned_duration = row.planned_duration
        adherence = 1 - (abs(real_duration - planned_duration) / planned_duration)
        adherence = max(0, min(1, adherence))

        for strategy in strategies:
            if strategy not in goal_strategy_data[goal_id]:
                goal_strategy_data[goal_id][strategy] = []
            goal_strategy_data[goal_id][strategy].append({'adherence': adherence})

    result = {}
    for gid, strategy_data in goal_strategy_data.items():
        result[gid] = {}
        for strategy, metrics in strategy_data.items():
            avg_adherence = sum(m['adherence'] for m in metrics) / len(metrics)
            result[gid][strategy] = {
                'adherence': round(avg_adherence, 2),
                'sessions_count': len(metrics),
            }

    return result


def get_goals_performance_summary(
    conn: Connection,
    student_id: int,
    goal_ids: list[str],
) -> dict[str, dict]:
    if not goal_ids:
        return {}

    started_events = (
        select(
            events.c.study_session_id,
            events.c.timestamp.label('started_at'),
        )
        .where(
            events.c.student_id == student_id,
            events.c.goal_id.in_(goal_ids),
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
            events.c.goal_id.in_(goal_ids),
            events.c.type == EventType.STUDY_SESSION_FINISHED,
        )
        .subquery()
    )

    stmt = (
        select(
            study_sessions.c.goal_id,
            started_events.c.started_at,
            finished_events.c.finished_at,
            study_sessions.c.rating,
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
            study_sessions.c.goal_id.in_(goal_ids),
            study_sessions.c.status == Status.done,
            started_events.c.started_at.isnot(None),
            finished_events.c.finished_at.isnot(None),
        )
    )

    rows = conn.execute(stmt).fetchall()

    result = {}
    goal_rows = {gid: [] for gid in goal_ids}
    for row in rows:
        goal_rows[row.goal_id].append(row)

    for gid, g_rows in goal_rows.items():
        if not g_rows:
            result[gid] = {
                'total_duration': 0.0,
                'avg_session_duration': 0.0,
                'avg_rating': 0.0,
                'sessions_count': 0,
            }
            continue

        total_duration = timedelta(0)
        ratings = []

        for row in g_rows:
            real_duration = row.finished_at - row.started_at
            total_duration += real_duration

            if row.rating is not None:
                ratings.append(row.rating)

        avg_session_duration = int(total_duration.total_seconds() / len(g_rows))
        avg_rating = sum(ratings) / len(ratings) if ratings else 0.0

        result[gid] = {
            'total_duration': int(total_duration.total_seconds()),
            'avg_session_duration': avg_session_duration,
            'avg_rating': round(avg_rating, 2),
            'sessions_count': len(g_rows),
        }

    return result
