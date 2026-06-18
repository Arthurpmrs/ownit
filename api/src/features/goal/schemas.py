from datetime import datetime

from pydantic import BaseModel

from src.shared.schemas import Status, StudySessionShortResponse


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


class GoalResponse(BaseModel):
    id: str
    student_id: int
    title: str
    description: str | None
    goal_tags: list[str] | None
    status: Status
    start_date: datetime | None = None
    end_date: datetime | None = None
    created_at: datetime
    updated_at: datetime
    progress: float | None = None


class GoalWithSessionsResponse(BaseModel):
    goal: GoalResponse
    sessions: list[StudySessionShortResponse]
