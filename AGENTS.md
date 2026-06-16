# Coding Agents Instructions

This document provides instructions for coding agents working on the Ownit project.

# Project Overview

Ownit is a Self-Regulated Learning (SRL) platform that helps users improve their learning habits and achieve their academic and professional goals.

## Features

- Authentication (Login / Registration)
- Study Planner
- Study Session Tracker
- Analytics dashboard with statistics and progress
- AI Assistant for personalized feedback and recommendations
- Goal Setting and Tracking
- Pomodoro Timer for focus sessions
- Feedback loop between sessions to improve planning

## Tech Stack

- Backend: 
    - Python 3.14
    - FastAPI 
    - SQLAlchemy (Core, not ORM)
    - Alembic (migrations)
    - Pydantic / Pydantic Settings (schemas and config)
    - bcrypt (password hashing)
    - uv (package manager)
    - Ruff (linter and formatter)
    - Pytest + testcontainers (testing)
- Frontend: 
    - TypeScript
    - React 19
    - Mantine 9 (core, dates, form, charts, hooks, notifications)
    - Vite
    - TanStack Router (file-based routing)
    - TanStack Query
    - Recharts (charting)
    - dayjs (date manipulation)
    - Phosphor Icons (icon set)
    - dnd-kit (drag and drop)
    - ESLint + Prettier (linting and formatting)
- AI: 
    - DeepSeek V4 Lite
    - Haystack
- Database: PostgreSQL 18
- Containerization: Docker
- CI/CD: GitHub Actions
- Orchestration: Docker Compose
- API Testing: Bruno

## Architecture

### Project Structure

```
ownit/
├── api/                        # Backend (FastAPI + Python)
│   ├── src/
│   │   ├── core/               # Shared infrastructure
│   │   │   ├── auth.py         # Auth dependency (get_current_student_id)
│   │   │   ├── config.py       # Settings via Pydantic Settings
│   │   │   ├── db.py           # Engine, metadata, connection dependency
│   │   │   └── logger.py       # Logging setup
│   │   └── features/           # Feature modules
│   │       ├── auth/           # Authentication feature
│   │       └── goal/           # Goal management feature
│   ├── migrations/             # Alembic migration versions
│   ├── scripts/                # Utility scripts (e.g., populate)
│   ├── tests/                  # Pytest test suite
│   ├── pyproject.toml          # Python dependencies and tool config
│   ├── alembic.ini             # Alembic configuration
│   ├── entrypoint.sh           # Docker entrypoint (migrations + start)
│   └── Dockerfile
├── ui/                         # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── features/           # Feature modules
│   │   │   ├── appshell/       # App shell (header, navbar, avatar menu)
│   │   │   ├── auth/           # Authentication feature
│   │   │   ├── goals/          # Goal management feature
│   │   │   └── statistics/     # Statistics / analytics feature
│   │   ├── routes/             # TanStack file-based routes
│   │   ├── main.tsx            # App entry point (providers, theme)
│   │   └── routeTree.gen.ts    # Auto-generated route tree
│   ├── package.json            # Node dependencies
│   ├── vite.config.ts          # Vite + TanStack Router plugin
│   ├── postcss.config.cjs      # Mantine PostCSS setup
│   └── Dockerfile
├── bruno/                      # Bruno API client collections
├── docs/                       # Documentation and specs
│   └── specs/                  # Feature specifications
├── docker-compose.yml          # Service orchestration (pgsql, api, ui)
├── .env.example                # Environment variable template
└── .github/workflows/ci.yml   # CI pipeline
```

### Backend Feature Module Pattern

Each feature lives in `api/src/features/<feature_name>/` with these files:

| File | Purpose |
|------|---------|
| `tables.py` | SQLAlchemy Core table definitions (using `Table()`, not ORM models) |
| `schemas.py` | Pydantic models for request/response validation |
| `service.py` | Business logic functions (receive `Connection` as first arg) |
| `routes.py` | FastAPI router with endpoint definitions |

Key conventions:
- Tables use `metadata` from `src.core.db` for Alembic integration
- Use `timestamp_columns()` from `src.core.db` for `created_at`/`updated_at`
- Routes use `Depends(get_connection)` for database access
- Protected routes use `Depends(get_current_student_id)` for authentication
- Routers are registered in `src/main.py` via `app.include_router()`

### Frontend Feature Module Pattern

Each feature lives in `ui/src/features/<feature_name>/` with these files:

| File | Purpose |
|------|---------|
| `models.ts` | TypeScript domain types (camelCase) |
| `dto.ts` | Data Transfer Object types matching the API response (snake_case) |
| `mappers.ts` | Functions to convert DTOs to domain models |
| `api.ts` | HTTP client functions + TanStack Query options |
| `hooks.ts` | Custom React hooks (TanStack Query mutations, etc.) |
| `components/` | React components for the feature |

Key conventions:
- API base URL comes from `import.meta.env.VITE_API_URL`
- All API calls use `credentials: 'include'` for cookie-based auth
- Query options are defined as functions returning `queryOptions({})`
- The `@` alias maps to `ui/src/` (configured in `vite.config.ts`)

### Authentication Flow

- Cookie-based session authentication (httpOnly cookie `session_token`)
- Login: `POST /auth/login` → sets session cookie
- Logout: `POST /auth/logout` → deletes session cookie
- Current user: `GET /auth/me` → returns student data
- Protected routes use the `get_current_student_id` dependency

### Service Orchestration (Docker Compose)

| Service | Port | Description |
|---------|------|-------------|
| `pgsql` | 5432 | PostgreSQL 18 Alpine |
| `api` | 8000 | FastAPI backend (runs migrations on startup) |
| `ui` | 3000 | Vite dev server |

Services communicate via the `ownit-network` Docker network. The API waits for PostgreSQL to be healthy before starting.

## Development Setup

### Running with Docker (full stack)

```bash
cp .env.example .env
docker compose up
```

### Running without Docker (local development)

1. Copy `.env.example` to `.env`
2. Change `DATABASE_URL` to `postgresql+psycopg://ownit_admin:ownit_admin@localhost:5432/ownit_dev`
3. Start the database: `docker compose up pgsql`
4. Start the backend: `cd api && uv run fastapi dev --reload src/main.py`
5. Copy `.env` into `ui/` (needed for `VITE_API_URL`)
6. Start the frontend: `cd ui && npm run dev`

## Coding Conventions

### Backend (Python)

- **Formatter/Linter**: Ruff
- **Quote style**: Single quotes
- **Line length**: 90 characters
- **Excluded from linting**: `migrations/` directory
- **Lint rules**: `I` (isort), `F` (pyflakes), `E`/`W` (pycodestyle), `PL` (pylint), `PT` (pytest), `N` (naming)
- **Import sorting**: Handled by Ruff's `I` rule
- **Magic numbers**: Avoid hardcoding magic numbers. Extract constants into configuration settings (`api/src/core/config.py` `Settings` class) where possible.
- **Server-Sent Events (SSE)**: When implementing SSE, do NOT return an `EventSourceResponse`. Instead, yield `fastapi.sse.ServerSentEvent` directly from an `async def` path operation function, relying on FastAPI's native support for generators.

### Frontend (TypeScript/React)

- **Localization**: ALL user-facing text and UI copy **MUST** be written in Portuguese (pt-BR). Do not use English for interface texts.
- **UI Design System**: You **MUST** read and adhere to the guidelines in `docs/ui/overview.md` for colors, styling, and typography before creating or modifying UI components.
- **Linter**: ESLint (with `eslint-config-mantine`)
- **Formatter**: Prettier
- **Styling**: Mantine components + PostCSS (with `postcss-preset-mantine`)
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Component Structure**: Follow the separation of concerns. Break down "God Components" into smaller, single-responsibility components (e.g., separate the trigger/layout wrapper from the internal content).
- **Mantine Best Practices**: Avoid inline `style={{ width, height }}` objects. Use Mantine's style props (e.g., `w={380}`, `h={500}`) to integrate smoothly with the theme engine and keep JSX clean.
- **TanStack Query Best Practices**:
  - Prefer using `queryClient.invalidateQueries({ queryKey: ... })` inside mutation `onSuccess` callbacks over directly returning and calling a query's `refetch()` function. This correctly updates the global cache.
  - When a query depends on an ID, ensure the query definition includes an `enabled: !!id` check to avoid initial requests with undefined parameters.

## Adding a New Feature

### Backend

1. Create `api/src/features/<feature_name>/` directory
2. Define tables in `tables.py` using SQLAlchemy Core `Table()`
3. Define Pydantic schemas in `schemas.py` (Create, Update, Response)
4. Implement business logic in `service.py`
5. Define routes in `routes.py` with an `APIRouter`
6. Register the router in `src/main.py` with `app.include_router()`
7. **CRITICAL**: Import your `tables.py` in `api/migrations/env.py` (e.g. `from src.features.<feature_name> import tables  # noqa`) so Alembic detects the new tables!
8. Create an Alembic migration: `uv run alembic revision --autogenerate -m "description"`
9. Apply: `uv run alembic upgrade head`

### Frontend

1. Create `ui/src/features/<feature_name>/` directory
2. Define domain types in `models.ts`
3. Define API response types in `dto.ts`
4. Create DTO-to-model mappers in `mappers.ts`
5. Implement API client functions in `api.ts`
6. Create TanStack Query hooks in `hooks.ts`
7. Build React components in `components/`
8. Add route files in `ui/src/routes/` (TanStack Router file-based routing)

## Testing

### Backend

- **Framework**: Pytest with testcontainers (spins up a real PostgreSQL container)
- **Run tests**: `cd api && uv run pytest tests`
- **Test structure**: Uses FastAPI `TestClient` with dependency overrides
- **Fixtures**: `conn` (database connection), `client` (test client), `student` (test user), `authenticated_client` (logged-in client)

## Database Migrations

- **Tool**: Alembic
- **Create migration**: `cd api && uv run alembic revision --autogenerate -m "description"`
- **Apply migrations**: `cd api && uv run alembic upgrade head`
- **Rollback**: `cd api && uv run alembic downgrade -1`
- **Note**: Migrations run automatically on Docker container startup via `entrypoint.sh`

## Environment Variables

Reference: `.env.example`

| Variable | Description |
|----------|-------------|
| `POSTGRES_DB` | PostgreSQL database name |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `DATABASE_URL` | SQLAlchemy connection string |
| `ENV` | Environment (`dev`, `test`, `prod`) |
| `VITE_API_URL` | Backend API URL for the frontend |

### Troubleshooting Missing Config Values in Tests

When adding new environment variables to `api/src/core/config.py` in the `Settings` class without default values, backend tests may fail with `pydantic_core._pydantic_core.ValidationError` indicating a missing field. 

To resolve this, ensure you update the `get_test_settings()` function inside `api/tests/conftest.py` to provide a mock or dummy value for the new setting.

Example:
```python
def get_test_settings() -> Settings:
    return Settings(
        DATABASE_URL='postgresql+psycopg://postgres:postgres@localhost:5432/postgres',
        ENV='test',
        YOUR_NEW_SETTING='mock_value',
    )
```

## CI/CD

The CI pipeline (`.github/workflows/ci.yml`) runs on PRs to `dev` and `main`:

**Frontend job**: ESLint → Prettier check → TypeScript type check  
**Backend job**: Ruff linting → Pytest test suite
