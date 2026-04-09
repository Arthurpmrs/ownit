from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.engine import Connection

from src.core.db import get_connection
from src.core.logger import get_logger

from . import service
from .schemas import GoalCreate, GoalResponse, GoalUpdate

logger = get_logger(__name__)
router = APIRouter(prefix='/goals', tags=['goals'])


@router.post('/', response_model=GoalResponse, status_code=HTTPStatus.CREATED)
def create_goal(payload: GoalCreate, conn: Connection = Depends(get_connection)):
    try:
        return service.create_goal(conn, payload)
    except Exception as e:
        logger.exception('Error creating goal')
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))


@router.get('/{goal_id}', response_model=GoalResponse)
def get_goal(goal_id: str, conn: Connection = Depends(get_connection)):
    goal = service.get_goal(conn, goal_id)

    if not goal:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail='Goal not found')

    return goal


@router.get('/student/{student_id}', response_model=list[GoalResponse])
def list_goals(student_id: int, conn: Connection = Depends(get_connection)):
    return service.list_goals(conn, student_id)


@router.put('/{goal_id}', response_model=GoalResponse)
def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    conn: Connection = Depends(get_connection),
):
    goal = service.update_goal(conn, goal_id, payload)

    if not goal:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail='Goal not found')

    return goal


@router.delete('/{goal_id}', status_code=HTTPStatus.NO_CONTENT)
def delete_goal(goal_id: str, conn: Connection = Depends(get_connection)):
    success = service.delete_goal(conn, goal_id)

    if not success:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail='Goal not found')
