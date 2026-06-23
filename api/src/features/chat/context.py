from datetime import datetime

import tiktoken
from pydantic import BaseModel
from sqlalchemy import Connection, func, select

from src.core.logger import get_logger
from src.features.auth.service import get_student
from src.features.auth.tables import sessions
from src.features.chat.context_queries import (
    get_active_doing_session,
    get_goals_performance_summary,
    get_goals_strategy_metrics,
    get_recent_events,
    get_recent_sessions,
    get_upcoming_sessions,
)
from src.features.goal.service import list_goals
from src.shared.schemas import Status

logger = get_logger(__name__)


class GoalContextItem(BaseModel):
    id: str
    title: str
    progress: float
    end_date: datetime | None
    goal_tags: list[str] | None


class SessionContextItem(BaseModel):
    id: str
    goal_title: str
    title: str
    status: str
    planned_to_start_at: datetime
    rating: float | None = None
    learning_difficulty_level: int | None = None
    domain_perception_level: int | None = None
    strategies: list[str] | None = None
    final_comment: str | None = None


class ActiveSessionContextItem(BaseModel):
    id: str
    goal_title: str
    title: str
    pomodoro_status: str | None = None
    current_remaining_duration: str | None = None


class UpcomingSessionContextItem(BaseModel):
    id: str
    goal_title: str
    title: str
    planned_to_start_at: datetime


class GoalMetricsContextItem(BaseModel):
    goal_id: str
    goal_title: str
    total_duration_seconds: int
    avg_session_duration_seconds: int
    avg_rating: float
    strategy_metrics: dict[str, dict]


class EventContextItem(BaseModel):
    id: int
    type: str
    timestamp: datetime
    context_data: dict


class StudentContext(BaseModel):
    name: str
    member_since: datetime | None
    active_goals: list[GoalContextItem]
    recent_sessions: list[SessionContextItem] | None = None
    metrics: list[GoalMetricsContextItem] | None = None
    active_session: ActiveSessionContextItem | None = None
    upcoming_sessions: list[UpcomingSessionContextItem] | None = None
    recent_events: list[EventContextItem] | None = None


def fetch_student_context(conn: Connection, student_id: int) -> StudentContext:  # noqa: PLR0914
    student = get_student(conn, student_id)

    try:
        member_since = conn.scalar(
            select(func.min(sessions.c.created_at)).where(
                sessions.c.student_id == student_id
            )
        )
    except Exception as e:
        logger.warning(f'Failed to fetch member_since for {student_id}: {e}')
        member_since = None

    try:
        goals = list_goals(conn, student_id, Status.doing, None)
        active_goals = [
            GoalContextItem(
                id=g.id,
                title=g.title,
                progress=g.progress,
                end_date=g.end_date,
                goal_tags=g.goal_tags,
            )
            for g in goals
        ]
    except Exception as e:
        logger.warning(f'Failed to fetch goals for {student_id}: {e}')
        active_goals = []

    recent_sessions = None
    try:
        rs = get_recent_sessions(conn, student_id)
        recent_sessions = [
            SessionContextItem(
                id=s['id'],
                goal_title=s['goal_title'],
                title=s['title'],
                status=(
                    s['status'].value if hasattr(s['status'], 'value') else s['status']
                ),
                planned_to_start_at=s['planned_to_start_at'],
                rating=s['rating'],
                learning_difficulty_level=s['learning_difficulty_level'],
                domain_perception_level=s['domain_perception_level'],
                strategies=s['strategies'],
                final_comment=s['final_comment'],
            )
            for s in rs
        ]
    except Exception as e:
        logger.warning(f'Failed to fetch recent sessions for {student_id}: {e}')

    metrics = None
    if active_goals:
        try:
            goal_ids = [g.id for g in active_goals]
            summaries = get_goals_performance_summary(conn, student_id, goal_ids)
            strats = get_goals_strategy_metrics(conn, student_id, goal_ids)

            metrics = []
            for g in active_goals:
                summary = summaries.get(g.id, {})
                strat = strats.get(g.id, {})
                metrics.append(
                    GoalMetricsContextItem(
                        goal_id=g.id,
                        goal_title=g.title,
                        total_duration_seconds=summary.get('total_duration', 0),
                        avg_session_duration_seconds=summary.get(
                            'avg_session_duration', 0
                        ),
                        avg_rating=summary.get('avg_rating', 0.0),
                        strategy_metrics=strat,
                    )
                )
        except Exception as e:
            logger.warning(f'Failed to fetch metrics for {student_id}: {e}')

    active_session = None
    try:
        act = get_active_doing_session(conn, student_id)
        if act:
            active_session = ActiveSessionContextItem(
                id=act['id'],
                goal_title=act['goal_title'],
                title=act['title'],
                pomodoro_status=(
                    act['pomodoro_status'].value
                    if hasattr(act['pomodoro_status'], 'value')
                    else act['pomodoro_status']
                ),
                current_remaining_duration=(
                    str(act['current_remaining_duration'])
                    if act['current_remaining_duration']
                    else None
                ),
            )
    except Exception as e:
        logger.warning(f'Failed to fetch active session for {student_id}: {e}')

    upcoming_sessions = None
    try:
        upc = get_upcoming_sessions(conn, student_id)
        upcoming_sessions = [
            UpcomingSessionContextItem(
                id=u['id'],
                goal_title=u['goal_title'],
                title=u['title'],
                planned_to_start_at=u['planned_to_start_at'],
            )
            for u in upc
        ]
    except Exception as e:
        logger.warning(f'Failed to fetch upcoming sessions for {student_id}: {e}')

    recent_events = None
    try:
        evs = get_recent_events(conn, student_id)
        recent_events = [
            EventContextItem(
                id=e['id'],
                type=e['type'].value if hasattr(e['type'], 'value') else e['type'],
                timestamp=e['timestamp'],
                context_data=e['context'],
            )
            for e in evs
        ]
    except Exception as e:
        logger.warning(f'Failed to fetch recent events for {student_id}: {e}')

    return StudentContext(
        name=student.name,
        member_since=member_since,
        active_goals=active_goals,
        recent_sessions=recent_sessions,
        metrics=metrics,
        active_session=active_session,
        upcoming_sessions=upcoming_sessions,
        recent_events=recent_events,
    )


def _format_profile(name: str, member_since: datetime | None) -> str:
    member_since_str = (
        member_since.strftime('%d/%m/%Y') if member_since else 'Desconhecido'
    )
    return f'### Perfil\n- Nome: {name}\n- Na plataforma desde: {member_since_str}\n'


def _format_goals(goals: list[GoalContextItem]) -> str:
    if not goals:
        return '### Metas Ativas\n- Nenhuma meta ativa no momento.\n'

    lines = [f'### Metas Ativas ({len(goals)})']
    for i, g in enumerate(goals, 1):
        deadline = f', prazo em {g.end_date.strftime("%d/%m/%Y")}' if g.end_date else ''
        lines.append(f'{i}. **{g.title}** — {int(g.progress * 100)}% concluído{deadline}')
        if g.goal_tags:
            lines.append(f'   - Tags: {", ".join(g.goal_tags)}')
    return '\n'.join(lines) + '\n'


def _format_current_state(
    active_session: ActiveSessionContextItem | None,
    upcoming_sessions: list[UpcomingSessionContextItem] | None,
) -> str:
    lines = ['### Estado Atual']
    if active_session:
        lines.append(
            f'- Sessão ativa: {active_session.title} ({active_session.goal_title})'
        )
        if active_session.pomodoro_status:
            lines.append(
                f'  Pomodoro: {active_session.pomodoro_status} '
                f'(resta {active_session.current_remaining_duration})'
            )
    else:
        lines.append('- Nenhuma sessão ativa no momento')

    if upcoming_sessions:
        up = upcoming_sessions[0]
        lines.append(
            f'- Próxima sessão: {up.title} ({up.goal_title}) — '
            f'{up.planned_to_start_at.strftime("%d/%m às %H:%M")}'
        )

    return '\n'.join(lines) + '\n'


def _format_recent_sessions(sessions: list[SessionContextItem]) -> str:
    lines = ['### Sessões Recentes (últimos 7 dias)']
    for s in sessions:
        lines.append(
            f'- "{s.title}" ({s.goal_title}) — {s.status} em '
            f'{s.planned_to_start_at.strftime("%d/%m")}'
        )
        if s.rating is not None:
            diff = s.learning_difficulty_level or '?'
            dom = s.domain_perception_level or '?'
            lines.append(
                f'  Rating: {s.rating:.1f}/5 | Dificuldade: {diff}/5 | Domínio: {dom}/5'
            )
        if s.strategies:
            lines.append(f'  Estratégias: {", ".join(s.strategies)}')
        if s.final_comment:
            lines.append(f'  Comentário: "{s.final_comment}"')
    return '\n'.join(lines) + '\n'


def _format_metrics(metrics: list[GoalMetricsContextItem]) -> str:
    lines = ['### Métricas de Desempenho']
    for m in metrics:
        hrs = m.total_duration_seconds / 3600
        mins = m.avg_session_duration_seconds // 60
        lines.append(
            f'- {m.goal_title}: {hrs:.1f}h dedicadas, {mins}min por sessão em média'
        )
        if m.strategy_metrics:
            strats = []
            for s_name, s_met in m.strategy_metrics.items():
                strats.append(f'{s_name} ({int(s_met["adherence"] * 100)}% aderência)')
            lines.append(f'  Estratégias: {", ".join(strats)}')
    return '\n'.join(lines) + '\n'


def _format_events(events: list[EventContextItem]) -> str:
    lines = ['### Eventos Recentes']
    for e in events:
        lines.append(f'- [{e.timestamp.strftime("%d/%m %H:%M")}] {e.type}')
    return '\n'.join(lines) + '\n'


def format_student_context(context: StudentContext) -> dict:
    sections = {}
    sections['profile'] = _format_profile(context.name, context.member_since)
    sections['goals'] = _format_goals(context.active_goals)
    sections['upcoming_sessions'] = _format_current_state(
        context.active_session, context.upcoming_sessions
    )

    if context.recent_sessions:
        sections['recent_sessions'] = _format_recent_sessions(context.recent_sessions)
    if context.metrics:
        sections['metrics'] = _format_metrics(context.metrics)
    if context.recent_events:
        sections['events'] = _format_events(context.recent_events)

    return sections


def truncate_context(formatted_sections: dict, max_tokens: int) -> str:
    enc = tiktoken.get_encoding('cl100k_base')

    least_important_first = [
        'events',
        'metrics',
        'recent_sessions',
        'upcoming_sessions',
        'goals',
        'profile',
    ]

    active_sections = list(reversed(least_important_first))

    while active_sections:
        full_text = '\n\n'.join(
            formatted_sections[s].strip()
            for s in active_sections
            if s in formatted_sections
        )
        tokens = enc.encode(full_text)

        if len(tokens) <= max_tokens:
            return full_text

        if len(active_sections) > 1:
            active_sections.pop()
        else:
            return enc.decode(tokens[:max_tokens])

    return ''


def build_student_context(conn: Connection, student_id: int, max_tokens: int) -> str:
    try:
        context_data = fetch_student_context(conn, student_id)
        formatted_sections = format_student_context(context_data)
        return truncate_context(formatted_sections, max_tokens)
    except Exception as e:
        logger.exception(
            f'Failed to build student context completely for {student_id}: {e}'
        )
        return ''
