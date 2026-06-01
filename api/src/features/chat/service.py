from sqlalchemy import insert, select
from sqlalchemy.engine import Connection

from src.core.logger import get_logger

from .schemas import ChatMessageResponse, ChatSessionResponse
from .tables import chat_messages, chat_sessions

logger = get_logger(__name__)

MAX_HISTORY_MESSAGES = 50


def _session_row_to_schema(row) -> ChatSessionResponse:
    return ChatSessionResponse(
        id=str(row._mapping['id']),
        student_id=row._mapping['student_id'],
        title=row._mapping['title'],
        created_at=row._mapping['created_at'],
        updated_at=row._mapping['updated_at'],
    )


def _message_row_to_schema(row) -> ChatMessageResponse:
    return ChatMessageResponse(
        id=str(row._mapping['id']),
        session_id=str(row._mapping['session_id']),
        role=row._mapping['role'],
        content=row._mapping['content'],
        llm_metadata=row._mapping['llm_metadata'],
        created_at=row._mapping['created_at'],
        updated_at=row._mapping['updated_at'],
    )


def create_session(conn: Connection, student_id: int) -> ChatSessionResponse:
    logger.info(f'Creating chat session for student_id={student_id}')

    stmt = insert(chat_sessions).values(student_id=student_id).returning(chat_sessions)
    result = conn.execute(stmt).fetchone()

    logger.info(f'Chat session created: id={result._mapping["id"]}')
    return _session_row_to_schema(result)


def get_active_session(conn: Connection, student_id: int) -> ChatSessionResponse | None:
    stmt = (
        select(chat_sessions)
        .where(chat_sessions.c.student_id == student_id)
        .order_by(chat_sessions.c.created_at.desc())
        .limit(1)
    )
    result = conn.execute(stmt).fetchone()

    if not result:
        return None

    return _session_row_to_schema(result)


def verify_session_ownership(conn: Connection, session_id: str, student_id: int) -> bool:
    stmt = select(chat_sessions).where(
        chat_sessions.c.id == session_id,
        chat_sessions.c.student_id == student_id,
    )
    result = conn.execute(stmt).fetchone()
    return result is not None


def get_messages(conn: Connection, session_id: str) -> list[ChatMessageResponse]:
    stmt = (
        select(chat_messages)
        .where(chat_messages.c.session_id == session_id)
        .order_by(chat_messages.c.created_at.asc())
    )
    results = conn.execute(stmt).fetchall()
    return [_message_row_to_schema(row) for row in results]


def save_user_message(
    conn: Connection, session_id: str, content: str
) -> ChatMessageResponse:
    logger.info(f'Saving user message for session_id={session_id}')

    stmt = (
        insert(chat_messages)
        .values(
            session_id=session_id,
            role='user',
            content=content,
        )
        .returning(chat_messages)
    )
    result = conn.execute(stmt).fetchone()
    return _message_row_to_schema(result)


def save_assistant_message(
    conn: Connection,
    session_id: str,
    content: str,
    llm_metadata: dict | None = None,
) -> ChatMessageResponse:
    logger.info(f'Saving assistant message for session_id={session_id}')

    stmt = (
        insert(chat_messages)
        .values(
            session_id=session_id,
            role='assistant',
            content=content,
            llm_metadata=llm_metadata,
        )
        .returning(chat_messages)
    )
    result = conn.execute(stmt).fetchone()
    return _message_row_to_schema(result)


def build_chat_history(conn: Connection, session_id: str) -> list[dict[str, str]]:
    """Build conversation history for the LLM.

    Returns the last MAX_HISTORY_MESSAGES messages as
    a list of {'role': ..., 'content': ...} dicts.
    """
    stmt = (
        select(
            chat_messages.c.role,
            chat_messages.c.content,
        )
        .where(chat_messages.c.session_id == session_id)
        .order_by(chat_messages.c.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES)
    )
    results = conn.execute(stmt).fetchall()

    # We ordered by desc to get the most recent, but the LLM needs them
    # in chronological order, so reverse the list
    results.reverse()

    return [
        {'role': row._mapping['role'], 'content': row._mapping['content']}
        for row in results
    ]
