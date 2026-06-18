import asyncio
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from fastapi.sse import EventSourceResponse, ServerSentEvent
from sqlalchemy.engine import Connection

from src.core.auth import get_current_student_id
from src.core.db import get_connection
from src.core.logger import get_logger
from src.features.chat import service
from src.features.chat.pipeline import (
    ChunkCollector,
    build_haystack_messages,
    run_pipeline_and_persist,
)
from src.features.chat.schemas import (
    ChatMessageResponse,
    ChatSessionResponse,
    SendMessageRequest,
)

logger = get_logger(__name__)
router = APIRouter(prefix='/chat', tags=['chat'])


@router.post(
    '/sessions',
    response_model=ChatSessionResponse,
    status_code=HTTPStatus.CREATED,
)
def create_session(
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    return service.create_session(conn, student_id)


@router.get(
    '/sessions/active',
    response_model=ChatSessionResponse,
)
def get_active_session(
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    session = service.get_active_session(conn, student_id)
    if not session:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='No active chat session found',
        )
    return session


@router.get(
    '/sessions/{session_id}/messages',
    response_model=list[ChatMessageResponse],
)
def get_messages(
    session_id: str,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    if not service.verify_session_ownership(conn, session_id, student_id):
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Chat session not found',
        )
    return service.get_messages(conn, session_id)


@router.post('/sessions/{session_id}/messages', response_class=EventSourceResponse)
async def send_message(
    session_id: str,
    payload: SendMessageRequest,
    conn: Connection = Depends(get_connection),
    student_id: int = Depends(get_current_student_id),
):
    # Verify ownership
    if not service.verify_session_ownership(conn, session_id, student_id):
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Chat session not found',
        )

    # Save user message before invoking LLM
    service.save_user_message(conn, session_id, payload.content)

    # Build conversation history for the LLM
    history = service.build_chat_history(conn, session_id)
    messages = build_haystack_messages(history)

    # Set up the streaming bridge
    loop = asyncio.get_running_loop()
    collector = ChunkCollector(loop)

    # Start pipeline as a background task — runs to completion
    # independently of the SSE stream
    asyncio.create_task(run_pipeline_and_persist(session_id, messages, collector))

    async for item in collector.stream():
        if item['type'] == 'token':
            yield ServerSentEvent(
                data={'content': item['content']},
                event='token',
            )
        elif item['type'] == 'done':
            yield ServerSentEvent(
                data=item['data'],
                event='done',
            )
        elif item['type'] == 'error':
            yield ServerSentEvent(
                data={'detail': item['detail']},
                event='error',
            )
