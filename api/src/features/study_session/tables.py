import enum

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Interval,
    String,
    Table,
)

from src.core.db import metadata, timestamp_columns


class StudySessionStatus(enum.Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'


study_sessions = Table(
    'study_sessions',
    metadata,
    Column('id', String, primary_key=True),
    Column('student_id', Integer, ForeignKey('students.id'), nullable=False),
    Column('goal_id', String, ForeignKey('goals.id'), nullable=False),
    Column('title', String, nullable=False),
    Column('description', String),
    Column('notes', String),
    Column(
        'status',
        Enum(StudySessionStatus),
        nullable=False,
        default=StudySessionStatus.PENDING,
    ),
    Column('planned_to_start_at', DateTime, nullable=False),
    Column('duration', Interval, nullable=False),
    Column('focus_mode_duration', Interval),
    Column('pause_mode_duration', Interval),
    *timestamp_columns(),
)
