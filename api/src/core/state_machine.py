from src.features.study_session.tables import PomodoroStatus
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


class PomodoroStateMachine:
    TRANSITIONS = {
        PomodoroStatus.not_started: {
            PomodoroStatus.focus_mode,
        },
        PomodoroStatus.focus_mode: {
            PomodoroStatus.focus_pause,
            PomodoroStatus.break_mode,
            PomodoroStatus.done,
            PomodoroStatus.not_started,
        },
        PomodoroStatus.focus_pause: {
            PomodoroStatus.focus_mode,
            PomodoroStatus.done,
            PomodoroStatus.not_started,
        },
        PomodoroStatus.break_mode: {
            PomodoroStatus.break_pause,
            PomodoroStatus.focus_mode,
            PomodoroStatus.done,
            PomodoroStatus.not_started,
        },
        PomodoroStatus.break_pause: {
            PomodoroStatus.break_mode,
            PomodoroStatus.done,
            PomodoroStatus.not_started,
        },
        PomodoroStatus.done: set(),
    }

    @classmethod
    def can_transition(
        cls,
        current: PomodoroStatus,
        target: PomodoroStatus,
    ) -> bool:
        return target in PomodoroStateMachine.TRANSITIONS.get(current, set())
