from src.shared.schemas import Status


class StudySessionStateMachine:
    TRANSITIONS = {
        'to_do': ['doing', 'canceled'],
        'doing': ['done', 'to_do', 'canceled'],
        'done': [],
        'canceled': [],
    }

    @staticmethod
    def can_transition(current_status: Status, next_status: Status) -> bool:
        return next_status.value in StudySessionStateMachine.TRANSITIONS.get(
            current_status.value, []
        )
