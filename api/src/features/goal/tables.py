from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.dialects.postgresql import ARRAY

from src.core.db import metadata, timestamp_columns

goals = Table(
    'goals',
    metadata,
    Column('id', String, primary_key=True),
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('title', String, nullable=False),
    Column('description', String, nullable=True),
    Column('status', String, nullable=False),
    Column('goal_tags', ARRAY(String), nullable=True),
    Column('start_date', DateTime),
    Column('end_date', DateTime),
    *timestamp_columns(),
)
