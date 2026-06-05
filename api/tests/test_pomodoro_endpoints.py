from http import HTTPStatus

from fastapi.testclient import TestClient

from src.features.study_session.tables import PomodoroStatus


def test_create_study_session_with_pomodoro(authenticated_client: TestClient, goal: dict):
    # Given - objetivo já criado via fixture

    # When - cria uma sessão com pomodoro
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão com Pomodoro',
        'description': 'Testando criação de pomodoro',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
        'focus_duration': 'PT25M',  # 25 minutos
        'break_duration': 'PT5M',  # 5 minutos
    }
    response = authenticated_client.post('/sessions/', json=payload)

    # Then
    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data['pomodoro'] is not None
    pomodoro = data['pomodoro']
    assert pomodoro['status'] == PomodoroStatus.not_started.value
    assert pomodoro['focus_duration'] == 'PT25M'
    assert pomodoro['break_duration'] == 'PT5M'


def test_create_study_session_without_pomodoro(
    authenticated_client: TestClient, goal: dict
):
    # Given - objetivo já criado via fixture

    # When - cria uma sessão SEM pomodoro
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão sem Pomodoro',
        'description': 'Testando criação sem pomodoro',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
    }
    response = authenticated_client.post('/sessions/', json=payload)

    # Then
    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data['pomodoro'] is None


def test_update_pomodoro_status_focus_mode(authenticated_client: TestClient, goal: dict):
    # Given - cria uma sessão com pomodoro
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Testar Pomodoro',
        'description': 'Testando transição de status',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
        'focus_duration': 'PT25M',
        'break_duration': 'PT5M',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # When - atualiza status para focus_mode
    update_payload = {'new_status': 'focus_mode'}
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json=update_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['status'] == PomodoroStatus.focus_mode.value
    assert data['current_remaining_duration'] == 'PT25M'


def test_update_pomodoro_status_focus_to_pause(
    authenticated_client: TestClient, goal: dict
):
    # Given - cria sessão com pomodoro e coloca em focus_mode
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Teste de Pause',
        'description': 'Testando pause',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
        'focus_duration': 'PT25M',
        'break_duration': 'PT5M',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # Coloca em focus_mode
    update_payload = {'new_status': 'focus_mode'}
    authenticated_client.patch(f'/sessions/{session_id}/pomodoro', json=update_payload)

    # When - pausa o focus_mode
    pause_payload = {'new_status': 'focus_pause'}
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json=pause_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['status'] == PomodoroStatus.focus_pause.value
    assert data['current_remaining_duration'] != 'PT25M'


def test_update_pomodoro_status_pause_to_focus(
    authenticated_client: TestClient, goal: dict
):
    # Given - cria sessão com pomodoro em focus_pause
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Teste de Resume',
        'description': 'Testando resume',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
        'focus_duration': 'PT25M',
        'break_duration': 'PT5M',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # Coloca em focus_mode
    update_payload = {'new_status': 'focus_mode'}
    authenticated_client.patch(f'/sessions/{session_id}/pomodoro', json=update_payload)

    # Pausa
    pause_payload = {'new_status': 'focus_pause'}
    authenticated_client.patch(f'/sessions/{session_id}/pomodoro', json=pause_payload)

    # When - retoma focus_mode
    resume_payload = {'new_status': 'focus_mode'}
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json=resume_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['status'] == PomodoroStatus.focus_mode.value
    assert data['current_remaining_duration'] != 'PT25M'


def test_update_pomodoro_status_focus_to_break(
    authenticated_client: TestClient, goal: dict
):
    # Given - cria sessão com pomodoro em focus_mode
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Teste de Break',
        'description': 'Testando transição para break',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
        'focus_duration': 'PT25M',
        'break_duration': 'PT5M',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # Coloca em focus_mode
    update_payload = {'new_status': 'focus_mode'}
    authenticated_client.patch(f'/sessions/{session_id}/pomodoro', json=update_payload)

    # When - transiciona para break_mode
    break_payload = {'new_status': 'break_mode'}
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json=break_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['status'] == PomodoroStatus.break_mode.value
    assert data['current_remaining_duration'] == 'PT5M'


def test_update_pomodoro_status_break_to_pause(
    authenticated_client: TestClient, goal: dict
):
    # Given - cria sessão com pomodoro em break_mode
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Teste de Break Pause',
        'description': 'Testando pause no break',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
        'focus_duration': 'PT25M',
        'break_duration': 'PT5M',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # Coloca em focus_mode e depois break_mode
    update_payload = {'new_status': 'focus_mode'}
    authenticated_client.patch(f'/sessions/{session_id}/pomodoro', json=update_payload)

    break_payload = {'new_status': 'break_mode'}
    authenticated_client.patch(f'/sessions/{session_id}/pomodoro', json=break_payload)

    # When - pausa o break_mode
    pause_payload = {'new_status': 'break_pause'}
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json=pause_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['status'] == PomodoroStatus.break_pause.value
    assert data['current_remaining_duration'] != 'PT5M'


def test_update_pomodoro_status_complete_cycle(
    authenticated_client: TestClient, goal: dict
):
    # Given - cria sessão com pomodoro
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Ciclo Completo',
        'description': 'Testando ciclo completo de pomodoro',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT2H',
        'focus_duration': 'PT25M',
        'break_duration': 'PT5M',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # When - percorre um ciclo completo:
    # not_started -> focus_mode -> break_mode -> focus_mode -> done

    # 1. Inicia focus
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json={'new_status': 'focus_mode'}
    )
    assert response.status_code == HTTPStatus.OK
    assert response.json()['status'] == PomodoroStatus.focus_mode.value

    # 2. Vai para break
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json={'new_status': 'break_mode'}
    )
    assert response.status_code == HTTPStatus.OK
    assert response.json()['status'] == PomodoroStatus.break_mode.value

    # 3. Volta para focus
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json={'new_status': 'focus_mode'}
    )
    assert response.status_code == HTTPStatus.OK
    assert response.json()['status'] == PomodoroStatus.focus_mode.value

    # 4. Finaliza
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json={'new_status': 'done'}
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    assert response.json()['status'] == PomodoroStatus.done.value


def test_update_pomodoro_status_invalid_transition(
    authenticated_client: TestClient, goal: dict
):
    # Given - cria sessão com pomodoro
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Teste de Transição Inválida',
        'description': 'Testando transição inválida',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
        'focus_duration': 'PT25M',
        'break_duration': 'PT5M',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # When - tenta uma transição inválida (not_started -> break_mode)
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json={'new_status': 'break_mode'}
    )

    # Then
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_pomodoro_not_found(authenticated_client: TestClient, goal: dict):
    # Given - cria uma sessão SEM pomodoro
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão sem Pomodoro',
        'description': 'Sem pomodoro',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # When - tenta atualizar pomodoro que não existe
    response = authenticated_client.patch(
        f'/sessions/{session_id}/pomodoro', json={'new_status': 'focus_mode'}
    )

    # Then
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_update_pomodoro_on_nonexistent_session(authenticated_client: TestClient):
    # When - tenta atualizar pomodoro de sessão que não existe
    response = authenticated_client.patch(
        '/sessions/id-inexistente/pomodoro', json={'new_status': 'focus_mode'}
    )

    # Then
    assert response.status_code == HTTPStatus.NOT_FOUND
