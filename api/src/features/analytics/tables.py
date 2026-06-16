import enum

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB

from src.core.db import metadata


class EventType(enum.Enum):
    GOAL_CREATED = 'GOAL_CREATED'
    GOAL_EDITED = 'GOAL_EDITED'
    GOAL_COMPLETED = 'GOAL_COMPLETED'
    GOAL_DELETED = 'GOAL_DELETED'
    STUDY_SESSION_CREATED = 'STUDY_SESSION_CREATED'
    STUDY_SESSION_STARTED = 'STUDY_SESSION_STARTED'
    STUDY_SESSION_FINISHED = 'STUDY_SESSION_FINISHED'
    STUDY_SESSION_CANCELED = 'STUDY_SESSION_CANCELED'
    STUDY_SESSION_EVALUATED = 'STUDY_SESSION_EVALUATED'
    STUDY_SESSION_EDITED_NOTES = 'STUDY_SESSION_EDIT_NOTES'
    STUDY_SESSION_ADDED_COMMENT = 'STUDY_SESSION_ADDED_COMMENT'
    POMODORO_FOCUS_MODE_STARTED = 'POMODORO_FOCUS_MODE_STARTED'
    POMODORO_BREAK_MODE_STARTED = 'POMODORO_BREAK_MODE_STARTED'
    POMODORO_PAUSED = 'POMODORO_PAUSED'
    POMODORO_RESUMED = 'POMODORO_RESUMED'
    POMODORO_RESTARTED = 'POMODORO_RESTARTED'
    POMODORO_FINISHED = 'POMODORO_FINISHED'


events = Table(
    'events',
    metadata,
    Column('id', BigInteger, primary_key=True),
    Column('type', Enum(EventType), nullable=False),
    Column('student_id', Integer, ForeignKey('students.id'), nullable=False),
    Column('goal_id', String, ForeignKey('goals.id')),
    Column('study_session_id', String, ForeignKey('study_sessions.id')),
    Column(
        'timestamp', DateTime(timezone=True), server_default=func.now(), nullable=False
    ),
    Column('context', JSONB, nullable=False),
)

Index(
    'ix_events_student_timestamp',
    events.c.student_id,
    events.c.timestamp,
)

Index(
    'ix_events_study_session_id',
    events.c.study_session_id,
)
