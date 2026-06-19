from datetime import datetime, timedelta, timezone
from typing import TypedDict

from sqlalchemy import Connection, exists, func, insert, select, update

from src.core.db import get_engine
from src.features.analytics.tables import EventType, events
from src.features.auth.service import create_student
from src.features.auth.tables import students
from src.features.goal.tables import goals
from src.features.study_session.tables import study_sessions
from src.shared.schemas import Status

DemoSession = TypedDict(
    'DemoSession',
    {
        'session_id': str,
        'name': str,
        'strategies': list[str],
        'planned_duration': timedelta,
        'real_duration': timedelta,
        'rating': float,
        'to_be_created_at': datetime,
    },
)


def _create_study_sessions(
    conn: Connection,
    now: datetime,
    student_id: int,
    goal_id: str,
    data: list[DemoSession],
):
    for i, session_data in enumerate(data):
        # Distribui as sessions ao longo dos próximos 18 dias
        base_date = now + timedelta(days=i * 3)
        planned_to_start = base_date.replace(hour=9, minute=0, second=0, microsecond=0)

        # Inserir study session com status to_do
        conn.execute(
            insert(study_sessions).values(
                id=session_data['session_id'],
                student_id=student_id,
                goal_id=goal_id,
                title=session_data['name'],
                description='Sessão de SRL para teste de autorregulação',
                notes='',
                status=Status.todo.value,  # to_do
                planned_to_start_at=planned_to_start,
                duration=session_data['planned_duration'],
                rating=session_data['rating'],
                domain_perception_level=4,
                learning_difficulty_level=3,
                strategies=session_data['strategies'],
                final_comment='',
            )
        )

        conn.execute(
            insert(events).values(
                type=EventType.STUDY_SESSION_CREATED,
                student_id=student_id,
                goal_id=goal_id,
                study_session_id=session_data['session_id'],
                timestamp=session_data['to_be_created_at'],
                context={'goal_status': 'to_do'},
            )
        )


def _update_study_session(
    conn: Connection,
    student_id: int,
    goal_id: str,
    session_id: str,
    timestamp: datetime,
):
    conn.execute(
        insert(events).values(
            type=EventType.STUDY_SESSION_UPDATED,
            student_id=student_id,
            goal_id=goal_id,
            study_session_id=session_id,
            timestamp=timestamp,
            context={
                'updated_fields': ['duration'],
                'goal_status': 'doing',
            },
        )
    )


def _create_study_session(
    conn: Connection,
    student_id: int,
    goal_id: str,
    data: DemoSession,
):
    planned_to_start = data['to_be_created_at'].replace(
        hour=9, minute=0, second=0, microsecond=0
    )

    conn.execute(
        insert(study_sessions).values(
            id=data['session_id'],
            student_id=student_id,
            goal_id=goal_id,
            title=data['name'],
            description='Sessão de SRL para teste de autorregulação',
            notes='',
            status=Status.todo.value,  # to_do
            planned_to_start_at=planned_to_start,
            duration=data['planned_duration'],
            rating=data['rating'],
            domain_perception_level=4,
            learning_difficulty_level=3,
            strategies=data['strategies'],
            final_comment='',
        )
    )

    conn.execute(
        insert(events).values(
            type=EventType.STUDY_SESSION_CREATED,
            student_id=student_id,
            goal_id=goal_id,
            study_session_id=data['session_id'],
            timestamp=data['to_be_created_at'],
            context={'goal_status': 'doing'},
        )
    )


def _cancel_study_session(
    conn: Connection,
    student_id: int,
    goal_id: str,
    session_id: str,
    timestamp: datetime,
):
    conn.execute(
        insert(events).values(
            type=EventType.STUDY_SESSION_CANCELED,
            student_id=student_id,
            goal_id=goal_id,
            study_session_id=session_id,
            timestamp=timestamp,
            context={
                'updated_fields': ['duration'],
                'goal_status': 'doing',
            },
        )
    )


def _execute_study_session(
    conn: Connection,
    student_id: int,
    goal_id: str,
    timestamp: datetime,
    data: DemoSession,
):
    # Calcular timestamps para execução
    started_at = timestamp.replace(hour=9, minute=0, second=0, microsecond=0)
    finished_at = started_at + data['real_duration']

    # EVENTO: STUDY_SESSION_STARTED
    conn.execute(
        insert(events).values(
            type=EventType.STUDY_SESSION_STARTED,
            student_id=student_id,
            goal_id=goal_id,
            study_session_id=data['session_id'],
            timestamp=started_at,
            context={},
        )
    )

    # EVENTO: STUDY_SESSION_FINISHED
    conn.execute(
        insert(events).values(
            type=EventType.STUDY_SESSION_FINISHED,
            student_id=student_id,
            goal_id=goal_id,
            study_session_id=data['session_id'],
            timestamp=finished_at,
            context={
                'rating': data['rating'],
                'domain_perception_level': 4,
                'learning_difficulty_level': 3,
                'strategies': data['strategies'],
            },
        )
    )

    # Atualizar study_session para status done
    conn.execute(
        update(study_sessions)
        .where(study_sessions.c.id == data['session_id'])
        .values(status=Status.done.value, updated_at=func.now())
    )


def _populate_demo_goal():
    """
    Popula um goal de demonstração com fluxo realista de SRL:
    1. Goal criado com status to_do (planejamento)
    2. Study sessions criadas com status to_do e goal_status='to_do' no contexto
    3. Goal alterado para doing (início da execução)
    4. Algumas operações de autorregulação (UPDATED, CANCELED com goal_status='doing')
    5. Execução das sessões (STARTED, FINISHED, EVALUATED)
    """
    with get_engine().begin() as conn:
        # Pega o student criado
        student = conn.execute(select(students)).fetchone()
        if not student:
            return

        student_id = student.id

        # Cria o goal de demo para SRL
        goal_id = 'DemoSRLGoalID2'

        stmt = select(exists().where(goals.c.id == goal_id))
        if bool(conn.scalar(stmt)):
            return

        now = datetime.now(timezone.utc)

        # FASE 1: Criar goal com status to_do (planejamento)
        conn.execute(
            insert(goals).values(
                id=goal_id,
                student_id=student_id,
                title='Autorregulação ao Plano de Estudos',
                description='Goal para demonstração de métricas de autorregulação e SRL',
                status=Status.todo.value,  # to_do
                goal_tags=['demo', 'srl'],
                start_date=now - timedelta(days=2),
                end_date=now + timedelta(days=40),
            )
        )

        # FASE 2: Criar study sessions com status to_do (planejamento)
        demo_sessions: list[DemoSession] = [
            {
                'session_id': 'session_demo_1',
                'name': 'Session 1 - Intro ao Tema',
                'strategies': ['VIDEO', 'READING'],
                'planned_duration': timedelta(hours=2),
                'real_duration': timedelta(hours=2, minutes=5),
                'rating': 5.0,
                'to_be_created_at': now + timedelta(minutes=5),
            },
            {
                'session_id': 'session_demo_2',
                'name': 'Session 2 - Prática Inicial',
                'strategies': ['PRACTICE'],
                'planned_duration': timedelta(minutes=90),
                'real_duration': timedelta(minutes=75),
                'rating': 4.5,
                'to_be_created_at': now + timedelta(minutes=8),
            },
            {
                'session_id': 'session_demo_3',
                'name': 'Session 3 - Revisão',
                'strategies': ['VIDEO', 'PRACTICE'],
                'planned_duration': timedelta(hours=1, minutes=30),
                'real_duration': timedelta(minutes=60),
                'rating': 3.5,
                'to_be_created_at': now + timedelta(minutes=9),
            },
            {
                'session_id': 'session_demo_4',
                'name': 'Session 4 - Aprofundamento',
                'strategies': ['READING'],
                'planned_duration': timedelta(hours=2),
                'real_duration': timedelta(minutes=45),
                'rating': 2.5,
                'to_be_created_at': now + timedelta(minutes=10),
            },
            {
                'session_id': 'session_demo_5',
                'name': 'Session 5 - Consolidação',
                'strategies': ['VIDEO'],
                'planned_duration': timedelta(hours=1),
                'real_duration': timedelta(hours=1, minutes=2),
                'rating': 5.0,
                'to_be_created_at': now + timedelta(minutes=12),
            },
            {
                'session_id': 'session_demo_6',
                'name': 'Session 6 - Síntese Final',
                'strategies': ['VIDEO', 'READING', 'PRACTICE'],
                'planned_duration': timedelta(hours=1, minutes=30),
                'real_duration': timedelta(hours=1, minutes=25),
                'rating': 4.0,
                'to_be_created_at': now + timedelta(minutes=15),
            },
        ]
        _create_study_sessions(conn, now, student_id, goal_id, demo_sessions)

        # FASE 3: Alterar goal para doing (iniciar a execução)
        execution_start = now + timedelta(days=1)
        conn.execute(
            update(goals)
            .where(goals.c.id == goal_id)
            .values(status=Status.doing.value, updated_at=func.now())
        )

        # EVENTO: GOAL_EDITED (implícito que mudou para doing)
        conn.execute(
            insert(events).values(
                type=EventType.GOAL_EDITED,
                student_id=student_id,
                goal_id=goal_id,
                timestamp=execution_start,
                context={'status_change': 'to_do -> doing'},
            )
        )

        # FASE 4: Operações de autorregulação (UPDATED, CREATE, CANCELED)
        # Semana 1
        week_1 = execution_start
        _execute_study_session(
            conn, student_id, goal_id, week_1 + timedelta(hours=5), demo_sessions[0]
        )

        _update_study_session(
            conn,
            student_id,
            goal_id,
            demo_sessions[1]['session_id'],
            timestamp=week_1 + timedelta(1),
        )

        _execute_study_session(
            conn,
            student_id,
            goal_id,
            week_1 + timedelta(days=2, hours=6),
            demo_sessions[1],
        )

        # Semana 2
        week_2 = week_1 + timedelta(days=7)

        _update_study_session(
            conn,
            student_id,
            goal_id,
            demo_sessions[2]['session_id'],
            timestamp=week_2 + timedelta(1),
        )

        _execute_study_session(
            conn,
            student_id,
            goal_id,
            week_2 + timedelta(days=2, hours=12),
            demo_sessions[2],
        )

        _update_study_session(
            conn,
            student_id,
            goal_id,
            demo_sessions[3]['session_id'],
            timestamp=week_2 + timedelta(4, hours=9),
        )

        _update_study_session(
            conn,
            student_id,
            goal_id,
            demo_sessions[3]['session_id'],
            timestamp=week_2 + timedelta(4, hours=13),
        )

        _execute_study_session(
            conn,
            student_id,
            goal_id,
            week_2 + timedelta(days=5, hours=2),
            demo_sessions[3],
        )

        new_study_session: DemoSession = {
            'session_id': 'session_demo_7',
            'name': 'Session 7 - Síntese Final',
            'strategies': ['SELF_EXPLANATION'],
            'planned_duration': timedelta(hours=1, minutes=10),
            'real_duration': timedelta(minutes=34),
            'rating': 1.0,
            'to_be_created_at': week_2 + timedelta(days=5, hours=3),
        }

        _create_study_session(conn, student_id, goal_id, new_study_session)

        _cancel_study_session(
            conn,
            student_id,
            goal_id,
            demo_sessions[4]['session_id'],
            week_2 + timedelta(days=6, hours=1),
        )

        # Semana 3
        week_3 = week_2 + timedelta(days=7)

        _execute_study_session(
            conn,
            student_id,
            goal_id,
            week_3 + timedelta(days=1, hours=2),
            demo_sessions[5],
        )

        _execute_study_session(
            conn,
            student_id,
            goal_id,
            week_3 + timedelta(days=5, hours=9),
            new_study_session,
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
    _populate_demo_goal()


if __name__ == '__main__':
    populate()
