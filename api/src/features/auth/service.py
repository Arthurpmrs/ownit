import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from sqlalchemy import and_, select
from sqlalchemy.engine import Connection

from src.features.auth.schemas import StudentResponse
from src.features.auth.tables import sessions, students


def hash_password(password: str) -> bytes:
    """Hash a password with bcrypt and generate a salt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())


def verify_password(password: str, password_hash: bytes) -> bool:
    """Verify that a password matches the stored hash."""
    return bcrypt.checkpw(password.encode(), password_hash)


def generate_session_token() -> str:
    """Generate a secure session token."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Hash a session token for secure storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(conn: Connection, student_id: int, expires_in: int = 24) -> str:
    """
    Create a new session for a student.

    Returns:
        Unhashed token (to be sent to client)
    """
    token = generate_session_token()
    token_hash = hash_token(token)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=expires_in)

    conn.execute(
        sessions.insert().values(
            token=token_hash,
            student_id=student_id,
            expires_at=expires_at,
        ),
    )

    return token


def authenticate_student(
    conn: Connection, email: str, password: str
) -> tuple[int, str, str] | None:
    """
    Authenticate a student with email and password.

    Returns:
        Tuple of (student_id, name, email) if successful, None otherwise
    """
    result = conn.execute(
        select(
            students.c.id,
            students.c.name,
            students.c.email,
            students.c.password,
        ).where(students.c.email == email),
    ).first()

    if not result:
        return None

    student_id, name, email_db, password_hash = result
    if not verify_password(password, password_hash.encode()):
        return None

    return student_id, name, email_db


def create_student(
    conn: Connection, email: str, password: str, name: str
) -> tuple[int, str, str]:
    """
    Create a new student account.

    Returns:
        Tuple of (student_id, name, email)
    """
    password_hash = hash_password(password)

    conn.execute(
        students.insert().values(
            email=email,
            password=password_hash.decode(),
            name=name,
        ),
    )

    result = conn.execute(
        select(students.c.id).where(students.c.email == email),
    ).first()

    if not result:
        raise RuntimeError('Failed to create student')

    student_id = result[0]
    return student_id, name, email


def validate_session_token(conn: Connection, token: str) -> int | None:
    """
    Validate a session token and return the student_id if valid.

    Returns:
        student_id if valid, None otherwise
    """
    token_hash = hash_token(token)
    now = datetime.now(timezone.utc)

    result = conn.execute(
        select(
            sessions.c.id,
            sessions.c.token,
            sessions.c.student_id,
            sessions.c.created_at,
            sessions.c.expires_at,
        ).where(
            and_(
                sessions.c.token == token_hash,
                sessions.c.expires_at > now,
            ),
        ),
    ).first()

    if not result:
        return None

    return result[2]  # student_id is at index 2


def get_student(conn: Connection, student_id: int) -> StudentResponse:
    result = conn.execute(
        select(students.c.id, students.c.name, students.c.email).where(
            students.c.id == student_id
        )
    ).first()

    if not result:
        raise Exception('User not found.')

    return StudentResponse(id=result[0], name=result[1], email=result[2])
