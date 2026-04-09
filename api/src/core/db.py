from functools import lru_cache
from typing import Any, Generator

from sqlalchemy import Column, DateTime, MetaData, create_engine, func
from sqlalchemy.engine import Connection

from src.core.config import get_settings


@lru_cache()
def get_engine():
    return create_engine(get_settings().DATABASE_URL, echo=True, future=True)


metadata = MetaData()


def get_connection() -> Generator[Connection, Any, Any]:
    with get_engine().begin() as conn:
        yield conn


def timestamp_columns():
    return [
        Column(
            'created_at',
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        ),
        Column(
            'updated_at',
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        ),
    ]
