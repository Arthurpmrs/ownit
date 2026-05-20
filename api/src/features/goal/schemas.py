from datetime import datetime

from pydantic import BaseModel


class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    goal_type: str
    rating: int | None = 0


class GoalUpdate(BaseModel):
    title: str | None
    description: str | None
    goal_type: str | None
    rating: int | None


class GoalResponse(BaseModel):
    id: str
    student_id: int
    title: str
    description: str | None
    goal_type: str
    rating: int
    created_at: datetime
    updated_at: datetime
