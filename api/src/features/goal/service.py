from uuid import uuid4

from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.engine import Connection

from src.core.logger import get_logger
from src.features.auth.tables import students

from .schemas import GoalCreate, GoalResponse, GoalUpdate, Status
from .tables import goals

logger = get_logger(__name__)


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
            status='to_do',
            goal_tags=payload.goal_tags,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
        .returning(goals)
    )

    result = conn.execute(stmt).fetchone()

    logger.info(f'Goal created with id={goal_id}')

    return _row_to_schema(result)


def get_goal(conn: Connection, student_id: int, goal_id: str) -> GoalResponse | None:
    stmt = select(goals).where(goals.c.id == goal_id, goals.c.student_id == student_id)
    result = conn.execute(stmt).fetchone()

    if not result:
        return None

    return _row_to_schema(result)


def list_goals(
    conn: Connection, student_id: int, status: Status | None, tags: list[str] | None
) -> list[GoalResponse]:
    stmt = select(goals).where(goals.c.student_id == student_id)

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

    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        return get_goal(conn, student_id, goal_id)

    stmt = (
        update(goals)
        .where(goals.c.id == goal_id, goals.c.student_id == student_id)
        .values(
            **update_data,
            updated_at=func.now(),
        )
        .returning(goals)
    )

    result = conn.execute(stmt).fetchone()

    if not result:
        return None

    return _row_to_schema(result)


def delete_goal(conn: Connection, student_id: int, goal_id: str) -> bool:
    stmt = delete(goals).where(goals.c.id == goal_id, goals.c.student_id == student_id)
    result = conn.execute(stmt)

    return result.rowcount > 0
