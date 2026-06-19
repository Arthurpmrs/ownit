from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.engine import Connection

from src.core.auth import get_current_student_id
from src.core.db import get_connection
from src.core.logger import get_logger
from src.features.analytics import service as analytics_service
from src.features.analytics.schemas import (
    MetricsResponse,
    SelfRegulationWeeklyMetric,
    StrategyAdherenceMetric,
)
from src.features.study_session import service as study_session_service
from src.shared.schemas import Status

from . import service
from .schemas import GoalCreate, GoalResponse, GoalUpdate, GoalWithSessionsResponse

logger = get_logger(__name__)
router = APIRouter(prefix='/goals', tags=['goals'])


@router.post('/', response_model=GoalResponse, status_code=HTTPStatus.CREATED)
def create_goal(
    payload: GoalCreate,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    try:
        return service.create_goal(conn, student_id, payload)
    except Exception as e:
        logger.exception('Error creating goal')
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))


@router.get('/{goal_id}', response_model=GoalWithSessionsResponse)
def get_goal(
    goal_id: str,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    goal = service.get_goal(conn, student_id, goal_id)

    if not goal:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail='Goal not found')

    sessions = study_session_service.get_goal_study_sessions(conn, student_id, goal_id)

    return GoalWithSessionsResponse(goal=goal, sessions=sessions)


@router.get('/student/{student_id}', response_model=list[GoalResponse])
def list_goals(
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
    status: Status | None = Query(None),
    tags: list[str] | None = Query(None),
):
    return service.list_goals(conn, student_id, status, tags)


@router.put('/{goal_id}', response_model=GoalResponse)
def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    goal = service.update_goal(conn, student_id, goal_id, payload)

    if not goal:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail='Goal not found')

    return goal


@router.delete('/{goal_id}', status_code=HTTPStatus.NO_CONTENT)
def delete_goal(
    goal_id: str,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    success = service.delete_goal(conn, student_id, goal_id)

    if not success:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail='Goal not found')


@router.get('/{goal_id}/metrics', response_model=MetricsResponse)
def get_goal_strategy_metrics(
    goal_id: str,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    strategy_metrics = analytics_service.get_strategy_metrics(conn, student_id, goal_id)
    sr_metrics = analytics_service.get_self_regulation_metrics(conn, student_id, goal_id)

    return MetricsResponse(
        goal_id=goal_id,
        strategy_adherence=[
            StrategyAdherenceMetric(
                strategy=strategy,
                adherence=data['adherence'],
                sessions_count=data['sessions_count'],
            )
            for strategy, data in strategy_metrics.items()
        ],
        sr_weekly=[SelfRegulationWeeklyMetric(**week_data) for week_data in sr_metrics],
    )
