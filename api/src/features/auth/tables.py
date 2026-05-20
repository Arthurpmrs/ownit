from sqlalchemy import Column, DateTime, Integer, String, Table, func

from src.core.db import metadata

students = Table(
    'students',
    metadata,
    Column('id', Integer, primary_key=True),
    Column('name', String),
    Column('email', String, unique=True),
    Column('password', String),
)

sessions = Table(
    'sessions',
    metadata,
    Column('id', Integer, primary_key=True),
    Column('token', String, unique=True),
    Column('student_id', Integer),
    Column(
        'created_at',
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    ),
    Column(
        'expires_at',
        DateTime(timezone=True),
        nullable=False,
    ),
)
