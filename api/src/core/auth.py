from fastapi import Depends, HTTPException, Request

from src.core.db import get_connection
from src.features.auth.service import validate_session_token


def get_current_student_id(request: Request, conn=Depends(get_connection)) -> int:
    token = request.cookies.get('session_token')

    if not token:
        raise HTTPException(status_code=401)

    current_student_id = validate_session_token(conn, token)

    if current_student_id is None:
        raise HTTPException(status_code=401)

    return current_student_id
