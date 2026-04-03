from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.engine import Connection

from src.core.db import get_connection

from . import service
from .schemas import GoalCreate, GoalUpdate

router = APIRouter(prefix='/goals', tags=['goals'])


@router.post('/')
def create_goal(payload: GoalCreate, conn: Connection = Depends(get_connection)):
    try:
        return service.create_goal(conn, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get('/{goal_id}')
def get_goal(goal_id: str, conn: Connection = Depends(get_connection)):
    goal = service.get_goal(conn, goal_id)

    if not goal:
        raise HTTPException(status_code=404, detail='Goal not found')

    return goal


@router.get('/student/{student_id}')
def list_goals(student_id: str, conn: Connection = Depends(get_connection)):
    return service.list_goals(conn, student_id)


@router.put('/{goal_id}')
def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    conn: Connection = Depends(get_connection),
):
    goal = service.update_goal(conn, goal_id, payload)

    if not goal:
        raise HTTPException(status_code=404, detail='Goal not found')

    return goal


@router.delete('/{goal_id}')
def delete_goal(goal_id: str, conn: Connection = Depends(get_connection)):
    success = service.delete_goal(conn, goal_id)

    if not success:
        raise HTTPException(status_code=404, detail='Goal not found')

    return {'deleted': True}
