from sqlalchemy import Column, ForeignKey, Integer, String, Table

from src.core.db import metadata, timestamp_columns

goals = Table(
    'goals',
    metadata,
    Column('id', String, primary_key=True),
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('title', String, nullable=False),
    Column('description', String, nullable=True),
    Column('goal_type', String, nullable=False),
    Column('rating', Integer, default=0),
    *timestamp_columns(),
)
