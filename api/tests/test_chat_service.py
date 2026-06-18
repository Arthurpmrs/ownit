from src.features.auth.service import create_student
from src.features.chat.service import (
    build_chat_history,
    create_session,
    get_active_session,
    get_messages,
    save_assistant_message,
    save_user_message,
    verify_session_ownership,
)


def test_create_session(conn, student):
    session = create_session(conn, student['id'])
    assert session.student_id == student['id']
    assert session.id is not None


def test_get_active_session(conn, student):
    # Should be None initially
    assert get_active_session(conn, student['id']) is None

    # Create session
    session1 = create_session(conn, student['id'])

    # Should return the active one
    active = get_active_session(conn, student['id'])
    assert active is not None
    assert active.id == session1.id


def test_save_user_message(conn, student):
    session = create_session(conn, student['id'])

    msg = save_user_message(conn, session.id, 'Hello James')

    assert msg.session_id == session.id
    assert msg.role == 'user'
    assert msg.content == 'Hello James'
    assert msg.llm_metadata is None

    messages = get_messages(conn, session.id)
    assert len(messages) == 1
    assert messages[0].content == 'Hello James'


def test_save_assistant_message(conn, student):
    session = create_session(conn, student['id'])

    metadata = {
        'model': 'deepseek-v4-lite',
        'prompt_tokens': 10,
        'completion_tokens': 20,
        'total_tokens': 30,
        'response_time_ms': 1000,
    }

    msg = save_assistant_message(conn, session.id, 'Hello User', llm_metadata=metadata)

    assert msg.role == 'assistant'
    assert msg.content == 'Hello User'
    assert msg.llm_metadata is not None
    assert msg.llm_metadata.model == 'deepseek-v4-lite'
    assert msg.llm_metadata.prompt_tokens == 10  # noqa: PLR2004


def test_build_chat_history(conn, student):
    session = create_session(conn, student['id'])

    # Save 55 messages (5 over the 50 limit)
    for i in range(55):
        if i % 2 == 0:
            save_user_message(conn, session.id, f'User msg {i}')
        else:
            save_assistant_message(conn, session.id, f'Assistant msg {i}')

    history = build_chat_history(conn, session.id)

    # Should be limited to 50 messages
    assert len(history) == 50  # noqa: PLR2004


def test_session_ownership(conn, student):
    # The `student` fixture gives us one student. Let's create another.

    student2_id, _, _ = create_student(conn, 'Student 2', 'student2@example.com', 'pwd')

    # Create session for student 1
    session = create_session(conn, student['id'])

    # Verify ownership
    assert verify_session_ownership(conn, session.id, student['id']) is True
    assert verify_session_ownership(conn, session.id, student2_id) is False
