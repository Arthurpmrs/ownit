from sqlalchemy import Column, ForeignKey, Integer, String, Table, func
from sqlalchemy.dialects.postgresql import JSONB, UUID

from src.core.db import metadata, timestamp_columns

chat_sessions = Table(
    'chat_sessions',
    metadata,
    Column(
        'id',
        UUID,
        primary_key=True,
        server_default=func.gen_random_uuid(),
    ),
    Column(
        'student_id',
        Integer,
        ForeignKey('students.id'),
        nullable=False,
    ),
    Column('title', String, nullable=True),
    *timestamp_columns(),
)

chat_messages = Table(
    'chat_messages',
    metadata,
    Column(
        'id',
        UUID,
        primary_key=True,
        server_default=func.gen_random_uuid(),
    ),
    Column(
        'session_id',
        UUID,
        ForeignKey('chat_sessions.id', ondelete='CASCADE'),
        nullable=False,
    ),
    Column('role', String, nullable=False),
    Column('content', String, nullable=False),
    Column('llm_metadata', JSONB, nullable=True),
    *timestamp_columns(),
)
