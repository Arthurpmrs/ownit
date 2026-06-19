from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from .tables import EventType


class EventCreate(BaseModel):
    type: EventType
    student_id: int
    goal_id: str | None = None
    study_session_id: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)


class StrategyAdherenceMetric(BaseModel):
    strategy: str
    adherence: float = Field(ge=0, le=1)
    sessions_count: int


class SelfRegulationWeeklyMetric(BaseModel):
    week: int
    week_start: datetime
    week_end: datetime
    sr_count: int
    finished_count: int
    avg_rating: float
    avg_domain_perception: float
    frequency: float


class MetricsResponse(BaseModel):
    goal_id: str
    strategy_adherence: list[StrategyAdherenceMetric]
    sr_weekly: list[SelfRegulationWeeklyMetric]
