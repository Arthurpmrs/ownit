from datetime import datetime, timedelta

from pydantic import BaseModel

from src.features.study_session.tables import StudySessionStatus


class StudySessionShortResponse(BaseModel):
    id: str
    title: str
    description: str
    status: StudySessionStatus
    planned_to_start_at: datetime
    planned_to_end_at: datetime
    duration: timedelta
