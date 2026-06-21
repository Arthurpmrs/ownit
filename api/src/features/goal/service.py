from uuid import uuid4

from pydantic_core import to_jsonable_python
from sqlalchemy import case, func, insert, select, update
from sqlalchemy.engine import Connection

from src.core.logger import get_logger
from src.features.analytics.schemas import EventCreate
from src.features.analytics.service import create_event
from src.features.analytics.tables import EventType
from src.features.auth.tables import students
from src.features.study_session.tables import study_sessions
from src.shared.schemas import Status

from .schemas import (
    GoalCreate,
    GoalResponse,
    GoalUpdate,
)
from .tables import goals

logger = get_logger(__name__)


def _get_goal_predicate(goal_id: str, student_id: int):
    return goals.c.id == goal_id, goals.c.student_id == student_id


def _row_to_schema(row) -> GoalResponse:
    return GoalResponse(**row._mapping)


def student_exists_by_id(conn: Connection, student_id: int) -> bool:
    stmt = select(students).where(students.c.id == student_id)
    result = conn.execute(stmt).fetchone()

    return False if result is None else True


def create_goal(conn: Connection, student_id: int, payload: GoalCreate) -> GoalResponse:
    logger.info(f'Creating goal for student_id={student_id}')

    goal_id = str(uuid4())

    if not student_exists_by_id(conn, student_id):
        logger.warning(f'Student not found: {student_id}')
        raise Exception('student does not exist!')

    stmt = (
        insert(goals)
        .values(
            id=goal_id,
            student_id=student_id,
            title=payload.title,
            description=payload.description,
            status=Status.todo,
            goal_tags=payload.goal_tags,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
        .returning(goals)
    )

    result = conn.execute(stmt).fetchone()

    logger.info(f'Goal created with id={goal_id}')

    create_event(
        conn,
        EventCreate(
            type=EventType.GOAL_CREATED,
            student_id=student_id,
            goal_id=goal_id,
        ),
    )

    return _row_to_schema(result)


def get_goal(conn: Connection, student_id: int, goal_id: str) -> GoalResponse | None:
    stmt = (
        select(goals)
        .where(goals.c.is_deleted.is_(False))
        .where(*_get_goal_predicate(goal_id, student_id))
    )
    result = conn.execute(stmt).fetchone()

    if not result:
        return None

    return _row_to_schema(result)


def list_goals(
    conn: Connection, student_id: int, status: Status | None, tags: list[str] | None
) -> list[GoalResponse]:
    stats = (
        select(
            study_sessions.c.goal_id,
            func.sum(
                case(
                    (study_sessions.c.status == 'done', 1),
                    else_=0,
                )
            ).label('done'),
            func.sum(
                case(
                    (study_sessions.c.status != 'canceled', 1),
                    else_=0,
                )
            ).label('total'),
        )
        .group_by(study_sessions.c.goal_id)
        .subquery()
    )

    stmt = (
        select(
            goals,
            func.coalesce(stats.c.done * 1.0 / func.nullif(stats.c.total, 0), 0).label(
                'progress'
            ),
        )
        .outerjoin(stats, goals.c.id == stats.c.goal_id)
        .where(goals.c.is_deleted.is_(False))
        .where(goals.c.student_id == student_id)
        .order_by(goals.c.updated_at.desc())
    )

    if status is not None:
        stmt = stmt.where(goals.c.status == status.value)

    if tags:
        stmt = stmt.where(goals.c.goal_tags.overlap(tags))

    results = conn.execute(stmt).fetchall()

    return [_row_to_schema(row) for row in results]


def update_goal(
    conn: Connection,
    student_id: int,
    goal_id: str,
    payload: GoalUpdate,
) -> GoalResponse | None:
    current_goal_row = conn.execute(
        select(goals).where(*_get_goal_predicate(goal_id, student_id))
    ).fetchone()

    if current_goal_row is None:
        return None

    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        return get_goal(conn, student_id, goal_id)

    stmt = (
        update(goals)
        .where(*_get_goal_predicate(goal_id, student_id))
        .values(
            **update_data,
            updated_at=func.now(),
        )
        .returning(goals)
    )

    result = conn.execute(stmt).fetchone()

    if not result:
        return None

    create_event(
        conn,
        EventCreate(
            type=EventType.GOAL_EDITED,
            student_id=student_id,
            goal_id=goal_id,
            context=to_jsonable_python({**current_goal_row._mapping}),
        ),
    )

    return _row_to_schema(result)


def delete_goal(conn: Connection, student_id: int, goal_id: str) -> bool:
    stmt = (
        update(goals)
        .where(*_get_goal_predicate(goal_id, student_id))
        .values(is_deleted=True, updated_at=func.now())
    )
    result = conn.execute(stmt)

    if result.rowcount == 0:
        return False

    create_event(
        conn,
        EventCreate(
            type=EventType.GOAL_DELETED,
            student_id=student_id,
            goal_id=goal_id,
        ),
    )

    return True
