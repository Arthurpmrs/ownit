from datetime import datetime, timedelta

from pydantic import BaseModel, Field

from src.shared.schemas import Status, StudySessionShortResponse

from .tables import PomodoroStatus


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
    pomodoro: PomodoroResponse | None = None
    rating: float | None = None
    domain_perception_level: int | None = None
    learning_difficulty_level: int | None = None
    strategies: list[str]
    final_comment: str | None = None
    created_at: datetime
    updated_at: datetime


class StudySessionStatusUpdate(BaseModel):
    new_status: Status


class StudySessionNotesUpdate(BaseModel):
    new_notes: str


class StudySessionEvaluate(BaseModel):
    rating: float = Field(ge=0.0, le=5.0)
    domain_perception_level: int = Field(ge=1, le=5)
    learning_difficulty_level: int = Field(ge=1, le=5)
    strategies: list[str]
    final_comment: str | None = None


class PomodoroResponse(BaseModel):
    id: int
    state_started_at: datetime
    state_remaining_duration: timedelta
    status: PomodoroStatus
    created_at: datetime
    updated_at: datetime


class PomodoroUpdate(BaseModel):
    new_status: PomodoroStatus
