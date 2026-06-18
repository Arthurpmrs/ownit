from datetime import datetime, timedelta, timezone
from typing import TypedDict
from uuid import uuid4

from sqlalchemy import exists, func, insert, select

from src.core.db import get_engine
from src.features.analytics.tables import EventType, events
from src.features.auth.service import create_student
from src.features.auth.tables import students
from src.features.goal.tables import goals
from src.features.study_session.tables import study_sessions

DemoSession = TypedDict(
    'DemoSession',
    {
        'name': str,
        'strategies': list[str],
        'planned_duration': timedelta,
        'real_duration': timedelta,
        'rating': float,
    },
)


def _populate_analytics_demo_goal():
    """
    Popula um goal de demonstração com várias study sessions
    e eventos para testar as métricas de SRL (aderência).
    """
    with get_engine().begin() as conn:
        # Pega o student criado
        student = conn.execute(select(students)).fetchone()
        if not student:
            return

        student_id = student.id

        # Cria o goal de demo
        goal_id = 'DemoGoalID'

        stmt = select(exists().where(goals.c.id == goal_id))
        if bool(conn.scalar(stmt)):
            return

        now = datetime.now(timezone.utc)

        conn.execute(
            insert(goals).values(
                id=goal_id,
                student_id=student_id,
                title='Aderência ao Plano de Estudos',
                description='Goal para demonstração de métricas de SRL',
                status='to_do',
                goal_tags=['demo', 'analytics'],
                start_date=now - timedelta(days=30),
                end_date=now + timedelta(days=30),
            )
        )

        # Define as sessions de demonstração com diferentes cenários
        demo_sessions: list[DemoSession] = [
            {
                'name': 'Session 1 - Excelente Aderência',
                'strategies': ['VIDEO', 'READING'],
                'planned_duration': timedelta(hours=2),
                'real_duration': timedelta(hours=2, minutes=5),
                'rating': 5.0,
            },
            {
                'name': 'Session 2 - Boa Aderência',
                'strategies': ['PRACTICE'],
                'planned_duration': timedelta(minutes=90),
                'real_duration': timedelta(minutes=75),
                'rating': 4.5,
            },
            {
                'name': 'Session 3 - Aderência Regular',
                'strategies': ['VIDEO', 'PRACTICE'],
                'planned_duration': timedelta(hours=1, minutes=30),
                'real_duration': timedelta(minutes=60),
                'rating': 3.5,
            },
            {
                'name': 'Session 4 - Baixa Aderência',
                'strategies': ['READING'],
                'planned_duration': timedelta(hours=2),
                'real_duration': timedelta(minutes=45),
                'rating': 2.5,
            },
            {
                'name': 'Session 5 - Aderência Excepcional',
                'strategies': ['VIDEO'],
                'planned_duration': timedelta(hours=1),
                'real_duration': timedelta(hours=1, minutes=2),
                'rating': 5.0,
            },
            {
                'name': 'Session 6 - Múltiplas Estratégias',
                'strategies': ['VIDEO', 'READING', 'PRACTICE'],
                'planned_duration': timedelta(hours=1, minutes=30),
                'real_duration': timedelta(hours=1, minutes=25),
                'rating': 4.0,
            },
            {
                'name': 'Session 7',
                'strategies': ['VIDEO'],
                'planned_duration': timedelta(hours=1, minutes=30),
                'real_duration': timedelta(hours=1, minutes=33),
                'rating': 4.2,
            },
            {
                'name': 'Session 8',
                'strategies': ['MIND_MAP'],
                'planned_duration': timedelta(hours=1, minutes=30),
                'real_duration': timedelta(hours=1, minutes=33),
                'rating': 4.2,
            },
        ]

        # Insere as sessions com eventos
        for i, session_data in enumerate(demo_sessions):
            session_id = str(uuid4())

            # Distribui as sessions ao longo dos últimos 18 dias
            base_date = now - timedelta(days=18 - (i * 3))
            planned_to_start = base_date.replace(
                hour=9, minute=0, second=0, microsecond=0
            )

            # Insere a study session
            conn.execute(
                insert(study_sessions).values(
                    id=session_id,
                    student_id=student_id,
                    goal_id=goal_id,
                    title=session_data['name'],
                    description='Sessão para teste de métricas de aderência',
                    notes='',
                    status='done',
                    planned_to_start_at=planned_to_start,
                    duration=session_data['planned_duration'],
                    rating=session_data['rating'],
                    domain_perception_level=4,
                    learning_difficulty_level=3,
                    strategies=session_data['strategies'],
                    final_comment='Sessão de demonstração',
                )
            )

            # Insere evento STUDY_SESSION_CREATED
            conn.execute(
                insert(events).values(
                    type=EventType.STUDY_SESSION_CREATED,
                    student_id=student_id,
                    goal_id=goal_id,
                    study_session_id=session_id,
                    timestamp=planned_to_start - timedelta(hours=1),
                    context={},
                )
            )

            # Insere evento STUDY_SESSION_STARTED
            # Alguns começam na hora, outros com pequeno atraso
            started_at = planned_to_start + timedelta(minutes=2 * i)
            conn.execute(
                insert(events).values(
                    type=EventType.STUDY_SESSION_STARTED,
                    student_id=student_id,
                    goal_id=goal_id,
                    study_session_id=session_id,
                    timestamp=started_at,
                    context={},
                )
            )

            # Insere evento STUDY_SESSION_FINISHED
            finished_at = started_at + session_data['real_duration']
            conn.execute(
                insert(events).values(
                    type=EventType.STUDY_SESSION_FINISHED,
                    student_id=student_id,
                    goal_id=goal_id,
                    study_session_id=session_id,
                    timestamp=finished_at,
                    context={},
                )
            )

            # Insere evento STUDY_SESSION_EVALUATED
            conn.execute(
                insert(events).values(
                    type=EventType.STUDY_SESSION_EVALUATED,
                    student_id=student_id,
                    goal_id=goal_id,
                    study_session_id=session_id,
                    timestamp=finished_at + timedelta(minutes=5),
                    context={
                        'rating': session_data['rating'],
                        'domain_perception_level': 4,
                        'learning_difficulty_level': 3,
                        'strategies': session_data['strategies'],
                    },
                )
            )


def _populate_default_user():
    with get_engine().begin() as conn:
        count = conn.execute(select(func.count()).select_from(students)).scalar()

        if count is not None and count > 0:
            return

        create_student(conn, 'student@ownit.com', 'Student123', name='Student')


def populate():
    _populate_default_user()
    # Popula os dados de demo após o student ser criado
    _populate_analytics_demo_goal()


if __name__ == '__main__':
    populate()
