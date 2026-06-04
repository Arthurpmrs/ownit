import enum

from sqlalchemy import (
    ARRAY,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    Interval,
    String,
    Table,
)

from src.core.db import metadata, timestamp_columns
from src.shared.schemas import Status


class PomodoroStatus(enum.Enum):
    not_started = 'not_started'
    focus_mode = 'focus_mode'
    focus_pause = 'focus_pause'
    break_mode = 'break'
    break_pause = 'break_pause'
    done = 'done'


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
    Column('strategies', ARRAY(String), default=list),
    Column('final_comment', String, nullable=False, default=''),
    *timestamp_columns(),
)

Index(
    'unique_active_session_per_student',
    study_sessions.c.student_id,
    unique=True,
    postgresql_where=study_sessions.c.status == 'doing',
)

study_session_pomodoros = Table(
    'study_session_pomodoros',
    metadata,
    Column('id', Integer, primary_key=True, unique=True),
    Column('study_session_id', String, ForeignKey('study_sessions.id'), nullable=False),
    Column('state_started_at', DateTime(timezone=True), nullable=False),
    Column('state_remaining_duration', Interval, nullable=False),
    Column(
        'status',
        Enum(PomodoroStatus),
        nullable=False,
        default=PomodoroStatus.not_started,
    ),
    *timestamp_columns(),
)
