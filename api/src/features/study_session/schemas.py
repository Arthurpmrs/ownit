from datetime import datetime, timedelta

from pydantic import BaseModel

from src.shared.schemas import StudySessionShortResponse


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
    rating: float
    domain_perception_level: int
    learning_difficulty_level: int
    strategies: list[str]
    final_comment: str
    created_at: datetime
    updated_at: datetime
