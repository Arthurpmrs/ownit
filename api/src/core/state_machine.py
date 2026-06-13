from src.features.study_session.tables import PomodoroStatus
from src.shared.schemas import Status


class StudySessionStateMachine:
    TRANSITIONS = {
        Status.todo: {Status.doing, Status.canceled},
        Status.doing: {Status.done, Status.todo, Status.canceled},
        Status.done: set(),
        Status.canceled: set(),
    }

    @staticmethod
    def can_transition(current: Status, target: Status) -> bool:
        return target in StudySessionStateMachine.TRANSITIONS.get(current, set())


class PomodoroStateMachine:
    TRANSITIONS = {
        PomodoroStatus.not_started: {
            PomodoroStatus.focus_mode,
            PomodoroStatus.done,
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
