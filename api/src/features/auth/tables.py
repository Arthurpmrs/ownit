from sqlalchemy import Column, Integer, String, Table

from src.core.db import metadata

students = Table(
    'students',
    metadata,
    Column('id', Integer, primary_key=True),
    Column('name', String),
    Column('email', String, unique=True),
)
