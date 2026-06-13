from datetime import datetime
from http import HTTPStatus
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Connection, create_engine
from testcontainers.postgres import PostgresContainer

# importa as definições de tabela para registro no metadata
import src.features.auth.tables  # noqa: F401
import src.features.chat.tables  # noqa: F401
import src.features.goal.tables  # noqa: F401
import src.features.study_session.tables  # noqa: F401
from src.core.config import Settings, get_settings
from src.core.db import get_connection, metadata
from src.features.auth.service import create_student
from src.features.goal.schemas import GoalCreate
from src.features.goal.service import create_goal
from src.main import app


def get_test_settings() -> Settings:
    return Settings(
        DATABASE_URL='postgresql+psycopg://postgres:postgres@localhost:5432/postgres',
        ENV='test',
        LLM_API_KEY='test_api_key',
    )


@pytest.fixture(scope='session')
def engine() -> Generator:
    with PostgresContainer('postgres:18-alpine', driver='psycopg') as postgres:
        _engine = create_engine(postgres.get_connection_url(), future=True)

        try:
            with _engine.begin() as conn:
                yield conn
        finally:
            _engine.dispose()


@pytest.fixture
def conn(engine: Connection) -> Generator:
    metadata.create_all(engine)
    yield engine
    metadata.drop_all(engine)


@pytest.fixture
def client(conn: Connection) -> Generator[TestClient, None, None]:
    def override_connection():
        return conn

    app.dependency_overrides[get_connection] = override_connection
    app.dependency_overrides[get_settings] = get_test_settings
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def student(conn: Connection) -> dict:
    student_data: dict[str, str | int] = {
        'name': 'Aluno de Teste',
        'email': 'teste@example.com',
        'password': 'abc123',
    }
    student_id, _, _ = create_student(conn, **student_data)
    student_data.update({'id': student_id})
    return student_data


@pytest.fixture
def goal(conn: Connection, student: dict) -> dict:
    goal_payload = GoalCreate(
        title='Meta de Teste',
        description='Meta criada para testes',
        goal_tags=['study', 'test'],
        start_date=datetime(2026, 5, 1, 0, 0, 0),
        end_date=datetime(2026, 5, 31, 23, 59, 59),
    )
    goal_response = create_goal(conn, student['id'], goal_payload)
    return goal_response.model_dump()


@pytest.fixture
def authenticated_client(client: TestClient, student: dict) -> TestClient:
    response = client.post(
        '/auth/login',
        json={
            'email': student['email'],
            'password': student['password'],
        },
    )

    assert response.status_code == HTTPStatus.OK

    return client
