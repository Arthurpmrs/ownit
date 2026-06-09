from typing import Any

from pydantic import BaseModel, Field

from .tables import EventType


class EventCreate(BaseModel):
    type: EventType
    student_id: str
    goal_id: str | None = None
    study_session_id: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)
