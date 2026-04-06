from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.engine import Connection

from src.core.db import get_connection
from src.features.auth.schemas import LoginRequest
from src.features.auth.service import (
    authenticate_student,
    create_session,
)

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/login')
def login(
    request: LoginRequest,
    response: Response,
    conn: Connection = Depends(get_connection),
):
    """Login endpoint that creates a session and returns a session token as a cookie."""
    # Authenticate student
    auth_result = authenticate_student(conn, request.email, request.password)

    if not auth_result:
        raise HTTPException(status_code=401, detail='Invalid email or password')

    student_id, name, email = auth_result

    # Create session token
    token = create_session(conn, student_id)

    response.set_cookie(
        key='session_token',
        value=token,
        httponly=True,
        secure=True,
        samesite='lax',
        max_age=86400,  # 24 hours
    )

    return {'message': 'ok'}
