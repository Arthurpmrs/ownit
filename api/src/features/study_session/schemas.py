from datetime import datetime, timedelta

from pydantic import BaseModel


class StudySessionCreate(BaseModel):
    goal_id: str
    title: str
    description: str
    planned_to_start_at: datetime
    duration: timedelta
    focus_mode_duration: timedelta | None = None
    pause_mode_duration: timedelta | None = None


class StudySessionResponse(BaseModel):
    id: str
    student_id: int
    goal_id: str
    title: str
    description: str
    planned_to_start_at: datetime
    duration: timedelta
    planned_to_end_at: datetime
    focus_mode_duration: timedelta | None = None
    pause_mode_duration: timedelta | None = None
    created_at: datetime
    updated_at: datetime
