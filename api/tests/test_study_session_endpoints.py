from http import HTTPStatus

from fastapi.testclient import TestClient


def test_create_and_get_study_session(authenticated_client: TestClient, goal: dict):
    # Given - objetivo já criado via fixture

    # When
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão de Estudo de Teste',
        'description': 'Testando endpoint de criação de sessão de estudo',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',  # 1 hora
    }
    response = authenticated_client.post('/sessions/', json=payload)

    # Then
    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data['goal_id'] == goal['id']
    assert data['title'] == payload['title']
    assert data['description'] == payload['description']
    assert data['status'] == 'to_do'
    assert not data['notes']
    assert data['rating'] is None

    # Verifica se consegue recuperar a sessão criada
    session_id = data['id']
    response = authenticated_client.get(f'/sessions/{session_id}')
    assert response.status_code == HTTPStatus.OK
    session_data = response.json()
    assert session_data['study_session']['id'] == session_id
    assert session_data['study_session']['goal_id'] == goal['id']
    assert session_data['study_session']['title'] == payload['title']


def test_update_study_session_status(authenticated_client: TestClient, goal: dict):
    # Given - cria uma sessão de estudo
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Atualizar Status',
        'description': 'Testando transição de status',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H30M',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    assert response.status_code == HTTPStatus.CREATED
    session_id = response.json()['id']

    # When - atualiza o status de 'todo' para 'doing'
    status_payload = {'new_status': 'doing'}
    response = authenticated_client.patch(
        f'/sessions/{session_id}/status', json=status_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['id'] == session_id
    assert data['status'] == 'doing'

    # When - atualiza o status de 'doing' para 'done'
    status_payload = {'new_status': 'done'}
    response = authenticated_client.patch(
        f'/sessions/{session_id}/status', json=status_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['status'] == 'done'


def test_update_study_session_status_invalid_transition(
    authenticated_client: TestClient, goal: dict
):
    # Given - cria uma sessão de estudo e a conclui
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Teste de Transição Inválida',
        'description': 'Testando transição inválida',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    authenticated_client.patch(
        f'/sessions/{session_id}/status', json={'new_status': 'done'}
    )

    # When - tenta ativar uma sessão já concluída (done -> doing é inválido)
    response = authenticated_client.patch(
        f'/sessions/{session_id}/status', json={'new_status': 'doing'}
    )

    # Then
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_todo_to_done_transition(authenticated_client: TestClient, goal: dict):
    # Given - cria uma sessão pendente
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão Pendente para Concluída',
        'description': 'Testando transição direta de to_do para done',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    assert response.status_code == HTTPStatus.CREATED
    session_id = response.json()['id']

    # When - conclui diretamente sem passar por 'doing'
    response = authenticated_client.patch(
        f'/sessions/{session_id}/status', json={'new_status': 'done'}
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    assert response.json()['status'] == 'done'


def test_cannot_have_multiple_active_sessions(
    authenticated_client: TestClient, goal: dict
):
    # Given - cria primeira sessão e a coloca em 'doing'
    payload1 = {
        'goal_id': goal['id'],
        'title': 'Primeira Sessão Ativa',
        'description': 'Primeira sessão',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
    }
    response1 = authenticated_client.post('/sessions/', json=payload1)
    session1_id = response1.json()['id']

    status_payload = {'new_status': 'doing'}
    response = authenticated_client.patch(
        f'/sessions/{session1_id}/status', json=status_payload
    )
    assert response.status_code == HTTPStatus.OK

    # When - cria segunda sessão e tenta colocá-la em 'doing'
    payload2 = {
        'goal_id': goal['id'],
        'title': 'Segunda Sessão',
        'description': 'Segunda sessão',
        'planned_to_start_at': '2026-05-06T10:00:00',
        'duration': 'PT1H',
    }
    response2 = authenticated_client.post('/sessions/', json=payload2)
    session2_id = response2.json()['id']

    response = authenticated_client.patch(
        f'/sessions/{session2_id}/status', json=status_payload
    )

    # Then - deve falhar pois já existe uma sessão ativa
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_update_study_session_notes(authenticated_client: TestClient, goal: dict):
    # Given - cria uma sessão de estudo
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Teste de Notas',
        'description': 'Testando atualização de notas',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    assert response.status_code == HTTPStatus.CREATED
    session_id = response.json()['id']

    # When - atualiza as notas da sessão
    notes_payload = {
        'new_notes': 'Estudei conceitos de decoradores em Python. Muito interessante!'
    }
    response = authenticated_client.patch(
        f'/sessions/{session_id}/notes', json=notes_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['notes'] == notes_payload['new_notes']

    # Verifica se as notas foram persistidas
    response = authenticated_client.get(f'/sessions/{session_id}')
    assert response.status_code == HTTPStatus.OK
    assert response.json()['study_session']['notes'] == notes_payload['new_notes']


def test_evaluate_study_session(authenticated_client: TestClient, goal: dict):
    # Given - cria uma sessão de estudo e a marca como 'done'
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão para Avaliação',
        'description': 'Testando avaliação de sessão',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # Transiciona para 'done'
    status_payload = {'new_status': 'doing'}
    authenticated_client.patch(f'/sessions/{session_id}/status', json=status_payload)

    status_payload = {'new_status': 'done'}
    response = authenticated_client.patch(
        f'/sessions/{session_id}/status', json=status_payload
    )
    assert response.status_code == HTTPStatus.OK

    # When - avalia a sessão
    evaluate_payload = {
        'rating': 4.5,
        'domain_perception_level': 4,
        'learning_difficulty_level': 2,
        'strategies': ['Active Recall', 'Spaced Repetition', 'Pomodoro'],
        'final_comment': 'Excelente sessão, aprendi bastante sobre o tópico.',
    }
    response = authenticated_client.patch(
        f'/sessions/{session_id}/evaluate', json=evaluate_payload
    )

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['rating'] == evaluate_payload['rating']
    assert data['domain_perception_level'] == evaluate_payload['domain_perception_level']
    assert (
        data['learning_difficulty_level'] == evaluate_payload['learning_difficulty_level']
    )
    assert data['strategies'] == evaluate_payload['strategies']
    assert data['final_comment'] == evaluate_payload['final_comment']


def test_evaluate_study_session_not_done(authenticated_client: TestClient, goal: dict):
    # Given - cria uma sessão de estudo mas NÃO a marca como 'done'
    payload = {
        'goal_id': goal['id'],
        'title': 'Sessão não finalizada',
        'description': 'Testando avaliação de sessão não finalizada',
        'planned_to_start_at': '2026-05-05T10:00:00',
        'duration': 'PT1H',
    }
    response = authenticated_client.post('/sessions/', json=payload)
    session_id = response.json()['id']

    # When - tenta avaliar uma sessão que ainda está em 'todo'
    evaluate_payload = {
        'rating': 4.5,
        'domain_perception_level': 4,
        'learning_difficulty_level': 2,
        'strategies': ['Active Recall'],
        'final_comment': 'Não deveria ser possível avaliar',
    }
    response = authenticated_client.patch(
        f'/sessions/{session_id}/evaluate', json=evaluate_payload
    )

    # Then - deve falhar pois a sessão não está em 'done'
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_get_nonexistent_study_session(authenticated_client: TestClient):
    # When
    response = authenticated_client.get('/sessions/id-inexistente')

    # Then
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_update_notes_on_nonexistent_session(authenticated_client: TestClient):
    # When
    notes_payload = {'new_notes': 'Algumas notas'}
    response = authenticated_client.patch(
        '/sessions/id-inexistente/notes', json=notes_payload
    )

    # Then
    assert response.status_code == HTTPStatus.NOT_FOUND
