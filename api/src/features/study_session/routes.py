from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.engine import Connection

from src.core.auth import get_current_student_id
from src.core.db import get_connection
from src.core.logger import get_logger

from . import service
from .schemas import (
    StudySessionCreate,
    StudySessionEvaluate,
    StudySessionNotesUpdate,
    StudySessionResponse,
    StudySessionStatusUpdate,
)

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
        logger.exception(f'Error creating study session for student_id={student_id}.')
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))


@router.get(path='/{study_session_id}', response_model=StudySessionResponse)
def get_study_session(
    study_session_id: str,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    study_session = service.get_study_session(conn, student_id, study_session_id)

    if not study_session:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail='StudySession not found.'
        )

    return study_session


@router.patch(path='/{study_session_id}/status', response_model=StudySessionResponse)
def update_study_session_status(
    study_session_id: str,
    payload: StudySessionStatusUpdate,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    try:
        return service.update_study_session_status(
            conn, student_id, study_session_id, payload.new_status
        )
    except Exception as e:
        logger.exception(
            f'Error updating StudySession({study_session_id}) '
            f'status to {payload.new_status}.'
        )
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))


@router.patch(path='/{study_session_id}/evaluate', response_model=StudySessionResponse)
def evaluate_study_session(
    study_session_id: str,
    payload: StudySessionEvaluate,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    try:
        return service.evaluate_study_session(conn, student_id, study_session_id, payload)
    except Exception as e:
        logger.exception(f'Error evaluating StudySession({study_session_id}).')
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))


@router.patch(path='/{study_session_id}/notes', response_model=StudySessionResponse)
def update_study_session_notes(
    study_session_id: str,
    payload: StudySessionNotesUpdate,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    try:
        return service.update_study_session_notes(
            conn, student_id, study_session_id, payload
        )
    except Exception as e:
        logger.exception(f'Error updating StudySession({study_session_id}) notes.')
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=str(e))
