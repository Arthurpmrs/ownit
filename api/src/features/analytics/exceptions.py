from .tables import EventType


class EventNotFountError(Exception):
    def __init__(self, goal_id: str, study_session_id: str, type: EventType):
        super().__init__(
            f'Failed to register event {type} for StudySession(id={study_session_id}) '
            f'and Goal(id={goal_id}).'
        )
        self.study_session_id = study_session_id
        self.goal_id = goal_id
        self.type = type
