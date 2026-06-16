from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class GoalNotFoundError(Exception):
    def __init__(self, goal_id: str):
        super().__init__(f'Goal(id={goal_id}) not found.')
        self.goal_id = goal_id


def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(GoalNotFoundError)
    async def entity_not_found_handler(
        request: Request,
        exc: GoalNotFoundError,
    ):
        return JSONResponse(
            status_code=HTTPStatus.NOT_FOUND, content={'detail': str(exc)}
        )
