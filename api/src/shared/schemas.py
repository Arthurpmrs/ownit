from datetime import datetime, timedelta
from enum import Enum

from pydantic import BaseModel


class StudySessionShortResponse(BaseModel):
    id: str
    title: str
    description: str
    status: Status
    planned_to_start_at: datetime
    planned_to_end_at: datetime
    duration: timedelta


class Status(str, Enum):
    todo = 'to_do'
    doing = 'doing'
    done = 'done'
    canceled = 'canceled'
