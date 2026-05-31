from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.engine import Connection

from src.core.auth import get_current_student_id
from src.core.db import get_connection
from src.core.logger import get_logger

from . import service
from .schemas import StudySessionCreate, StudySessionResponse

logger = get_logger(__name__)
router = APIRouter(prefix='/sessions', tags=['sessions', 'study-sessions'])


@router.post('/', response_model=StudySessionResponse, status_code=HTTPStatus.CREATED)
def create_study_session(
    payload: StudySessionCreate,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    try:
        return service.create_study_session(conn, student_id, payload)
    except Exception as e:
        logger.exception(f'Error creating study session for student_id={student_id}')
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))
