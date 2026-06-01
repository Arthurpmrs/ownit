from datetime import datetime
from enum import Enum

from pydantic import BaseModel

from src.shared.schemas import StudySessionShortResponse


class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    goal_tags: list[str] | None = None
    start_date: datetime
    end_date: datetime


class GoalUpdate(BaseModel):
    title: str | None
    description: str | None
    goal_tags: list[str] | None = None
    start_date: datetime
    end_date: datetime


class GoalShortResponse(BaseModel):
    id: str
    title: str
    description: str | None
    goal_tags: list[str] | None
    status: Status
    start_date: datetime | None = None
    end_date: datetime | None = None


class GoalResponse(GoalShortResponse):
    student_id: int
    goal_tags: list[str] | None
    sessions: list[StudySessionShortResponse]
    created_at: datetime
    updated_at: datetime


class Status(str, Enum):
    todo = 'to_do'
    doing = 'doing'
    done = 'done'
    canceled = 'canceled'
