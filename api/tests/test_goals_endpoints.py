from http import HTTPStatus

from sqlalchemy import insert

from src.features.auth.tables import students


def test_create_and_get_goal(authenticated_client, student, conn):
    # Given - estudante já criado via fixture

    # When
    payload = {
        'title': 'Aprender pytest',
        'description': 'Testando endpoint de criação',
        'goal_tags': ['study'],
        'start_date': '2026-05-01T00:00:00',
        'end_date': '2026-05-31T00:00:00',
    }
    response = authenticated_client.post('/goals/', json=payload)

    # Then
    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data['student_id'] == student['id']
    assert data['title'] == payload['title']
    assert data['description'] == payload['description']
    assert data['goal_tags'] == payload['goal_tags']
    assert data['start_date'] == payload['start_date']
    assert data['end_date'] == payload['end_date']

    # Verifica se consegue recuperar a meta criada
    goal_id = data['id']
    response = authenticated_client.get(f'/goals/{goal_id}')
    assert response.status_code == HTTPStatus.OK
    assert response.json()['id'] == goal_id


def test_list_goals_by_student(authenticated_client, student):
    # Given - cria múltiplas metas para o mesmo estudante
    payload1 = {
        'title': 'Meta 1',
        'description': 'Primeira meta',
        'goal_tags': ['study'],
        'start_date': '2026-05-01T00:00:00',
        'end_date': '2026-05-31T00:00:00',
    }
    payload2 = {
        'title': 'Meta 2',
        'description': 'Segunda meta',
        'goal_tags': ['exercise'],
        'start_date': '2026-05-01T00:00:00',
        'end_date': '2026-05-31T00:00:00',
    }

    response1 = authenticated_client.post('/goals/', json=payload1)
    response2 = authenticated_client.post('/goals/', json=payload2)
    assert response1.status_code == HTTPStatus.CREATED
    assert response2.status_code == HTTPStatus.CREATED

    # When
    response = authenticated_client.get(f'/goals/student/{student["id"]}')

    # Then
    assert response.status_code == HTTPStatus.OK
    goals = response.json()
    assert len(goals) == 2  # noqa
    assert goals[0]['title'] == 'Meta 1'
    assert goals[1]['title'] == 'Meta 2'


def test_update_goal(authenticated_client, student):
    # Given - cria uma meta
    payload = {
        'title': 'Meta Original',
        'description': 'Descrição original',
        'goal_tags': ['study'],
        'start_date': '2026-05-01T00:00:00',
        'end_date': '2026-05-31T00:00:00',
    }
    response = authenticated_client.post('/goals/', json=payload)
    goal_id = response.json()['id']

    # When - atualiza a meta
    update_payload = {
        'title': 'Meta Atualizada',
        'description': 'Descrição original',
        'goal_tags': ['study'],
        'start_date': '2026-06-01T00:00:00',
        'end_date': '2026-06-30T00:00:00',
    }
    response = authenticated_client.put(f'/goals/{goal_id}', json=update_payload)

    # Then
    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data['id'] == goal_id
    assert data['title'] == 'Meta Atualizada'
    assert data['start_date'] == update_payload['start_date']
    assert data['end_date'] == update_payload['end_date']
    # verifica que outros campos não foram alterados
    assert data['description'] == 'Descrição original'
    assert data['student_id'] == student['id']


def test_delete_goal(authenticated_client, student):
    # Given - cria uma meta
    payload = {
        'title': 'Meta para Deletar',
        'description': 'Esta meta será deletada',
        'goal_tags': ['study'],
        'start_date': '2026-05-01T00:00:00',
        'end_date': '2026-05-31T00:00:00',
    }
    response = authenticated_client.post('/goals/', json=payload)
    goal_id = response.json()['id']

    # When - deleta a meta
    response = authenticated_client.delete(f'/goals/{goal_id}')

    # Then
    assert response.status_code == HTTPStatus.NO_CONTENT

    # Verifica que a meta foi deletada
    response = authenticated_client.get(f'/goals/{goal_id}')
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_get_goal_not_found(authenticated_client):
    # When
    response = authenticated_client.get('/goals/id-inexistente')

    # Then
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_create_goal_student_not_found(client):
    # Given - estudante que não existe

    # When
    payload = {
        'student_id': 999,  # ID que não existe
        'title': 'Meta sem estudante',
        'description': 'Isso deve falhar',
        'goal_tags': ['study'],
        'start_date': '2026-05-01T00:00:00',
        'end_date': '2026-05-31T00:00:00',
    }
    response = client.post('/goals/', json=payload)

    # Then
    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_update_goal_not_found(authenticated_client):
    # When - tenta atualizar uma meta que não existe
    payload = {
        'title': 'Meta sem estudante',
        'description': 'Isso deve falhar',
        'goal_tags': ['study'],
        'start_date': '2026-05-01T00:00:00',
        'end_date': '2026-05-31T00:00:00',
    }
    response = authenticated_client.put('/goals/99999', json=payload)

    # Then
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_list_goals_empty_student(authenticated_client, conn):
    # Given - cria um estudante sem metas
    student_data = {'id': 2, 'name': 'Aluno Vazio', 'email': 'vazio@example.com'}
    conn.execute(insert(students).values(student_data))

    # When
    response = authenticated_client.get(f'/goals/student/{student_data["id"]}')

    # Then
    assert response.status_code == HTTPStatus.OK
    goals = response.json()
    assert len(goals) == 0
