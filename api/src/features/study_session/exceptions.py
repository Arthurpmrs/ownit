from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from src.shared.schemas import Status


class StudySessionNotFoundError(Exception):
    def __init__(self, study_session_id: str):
        super().__init__(f'StudySession(id={study_session_id}) not found.')
        self.study_session_id = study_session_id


class InvalidTransitionError(Exception):
    def __init__(self, study_session_id: str, current: Status, new: Status):
        super().__init__(
            f'StudySession(id={study_session_id}): '
            f'Cannot transition from {current} to {new}'
        )
        self.study_session_id = study_session_id
        self.current = current
        self.new = new


class ActiveSessionExistsError(Exception):
    def __init__(self, study_session_id: str):
        super().__init__(
            f'StudySession({study_session_id}): Cannot update. Active session exists.'
        )
        self.study_session_id = study_session_id


class WrongStudySessionStateError(Exception):
    def __init__(self, study_session_id: str):
        super().__init__(
            f'StudySession({study_session_id}): '
            'Cannot evaluate a study session that is not done!'
        )
        self.study_session_id = study_session_id


def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(StudySessionNotFoundError)
    async def entity_not_found_handler(
        request: Request,
        exc: StudySessionNotFoundError,
    ):
        return JSONResponse(
            status_code=HTTPStatus.NOT_FOUND, content={'detail': str(exc)}
        )
