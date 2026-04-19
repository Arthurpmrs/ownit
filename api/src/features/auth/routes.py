from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.engine import Connection

from src.core.auth import get_current_student_id
from src.core.db import get_connection
from src.features.auth.schemas import LoginRequest, SignupRequest, StudentResponse
from src.features.auth.service import (
    authenticate_student,
    create_session,
    create_student,
    delete_session,
    get_student,
)
from src.features.auth.tables import students

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/signup', response_model=StudentResponse)
def signup(
    request: SignupRequest,
    conn: Connection = Depends(get_connection),
):
    """Signup endpoint to create a new student account."""
    # Check if email already exists
    result = conn.execute(
        select(students).where(students.c.email == request.email),
    ).first()

    if result:
        raise HTTPException(status_code=400, detail='Email already registered')

    # Create new student
    student_id, name, email = create_student(
        conn, request.email, request.password, request.name
    )

    return StudentResponse(id=student_id, name=name, email=email)


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


@router.post('/logout')
def logout(
    request: Request,
    response: Response,
    conn: Connection = Depends(get_connection),
):
    token = request.cookies.get('session_token')

    if not token:
        raise HTTPException(status_code=401)

    delete_session(conn, token)

    # remove cookie no browser
    response.delete_cookie(
        key='session_token',
        httponly=True,
        secure=True,
        samesite='lax',
    )

    return {'message': 'logged out'}


@router.get('/me')
def me(
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    return get_student(conn, student_id)
