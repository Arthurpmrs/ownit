from datetime import datetime, timedelta

from pydantic import BaseModel, Field

from src.shared.schemas import EventResponse, Status, StudySessionShortResponse

from .tables import PomodoroStatus


class StudySessionCreate(BaseModel):
    goal_id: str
    title: str
    description: str
    planned_to_start_at: datetime
    duration: timedelta
    focus_duration: timedelta | None = None
    break_duration: timedelta | None = None


class StudySessionResponse(StudySessionShortResponse):
    student_id: int
    goal_id: str
    goal_title: str
    notes: str
    pomodoro: PomodoroResponse | None = None
    rating: float | None = None
    domain_perception_level: int | None = None
    learning_difficulty_level: int | None = None
    strategies: list[str]
    final_comment: str | None = None
    created_at: datetime
    updated_at: datetime


class StudySessionWithHistory(BaseModel):
    study_session: StudySessionResponse
    history: list[EventResponse]


class StudySessionStatusUpdate(BaseModel):
    new_status: Status


class StudySessionNotesUpdate(BaseModel):
    new_notes: str


class StudySessionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    planned_to_start_at: datetime | None = None
    duration: timedelta | None = None
    focus_duration: timedelta | None = None
    break_duration: timedelta | None = None


class StudySessionEvaluate(BaseModel):
    rating: float = Field(ge=0.0, le=5.0)
    domain_perception_level: int = Field(ge=1, le=5)
    learning_difficulty_level: int = Field(ge=1, le=5)
    strategies: list[str]
    final_comment: str | None = None


class PomodoroResponse(BaseModel):
    id: int
    study_session_id: str
    status: PomodoroStatus
    current_started_at: datetime
    current_remaining_duration: timedelta
    focus_duration: timedelta
    break_duration: timedelta
    created_at: datetime
    updated_at: datetime


class PomodoroUpdate(BaseModel):
    new_status: PomodoroStatus


class CommentCreate(BaseModel):
    comment: str
