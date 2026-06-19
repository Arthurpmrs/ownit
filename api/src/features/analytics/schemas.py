from typing import Any

from pydantic import BaseModel, Field

from .tables import EventType


class EventCreate(BaseModel):
    type: EventType
    student_id: int
    goal_id: str | None = None
    study_session_id: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)


class StrategyMetric(BaseModel):
    strategy: str
    adherence: float = Field(ge=0, le=1)
    sessions_count: int


class MetricsResponse(BaseModel):
    goal_id: str
    strategy_adherence: list[StrategyMetric]
