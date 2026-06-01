from sqlalchemy import (
    ARRAY,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Interval,
    String,
    Table,
)

from src.core.db import metadata, timestamp_columns
from src.shared.schemas import Status

study_sessions = Table(
    'study_sessions',
    metadata,
    Column('id', String, primary_key=True),
    Column('student_id', Integer, ForeignKey('students.id'), nullable=False),
    Column('goal_id', String, ForeignKey('goals.id'), nullable=False),
    Column('title', String, nullable=False),
    Column('description', String, nullable=False),
    Column('notes', String, nullable=False, default=''),
    Column(
        'status',
        Enum(Status),
        nullable=False,
        default=Status.todo,
    ),
    Column('planned_to_start_at', DateTime, nullable=False),
    Column('duration', Interval, nullable=False),
    Column('focus_mode_duration', Interval),
    Column('pause_mode_duration', Interval),
    Column('rating', Float),
    Column('domain_perception_level', Integer),
    Column('learning_difficulty_level', Integer),
    Column('strategies', ARRAY(String)),
    Column('final_comment', String, nullable=False, default=''),
    *timestamp_columns(),
)
