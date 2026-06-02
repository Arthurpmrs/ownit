from datetime import datetime, timedelta

from pydantic import BaseModel

from src.shared.schemas import Status, StudySessionShortResponse


class StudySessionCreate(BaseModel):
    goal_id: str
    title: str
    description: str
    planned_to_start_at: datetime
    duration: timedelta
    focus_mode_duration: timedelta | None = None
    pause_mode_duration: timedelta | None = None


class StudySessionResponse(StudySessionShortResponse):
    student_id: int
    goal_id: str
    goal_title: str
    notes: str
    focus_mode_duration: timedelta | None = None
    pause_mode_duration: timedelta | None = None
    rating: float | None = None
    domain_perception_level: int | None = None
    learning_difficulty_level: int | None = None
    strategies: list[str]
    final_comment: str | None = None
    created_at: datetime
    updated_at: datetime


class StudySessionStatusUpdate(BaseModel):
    new_status: Status
