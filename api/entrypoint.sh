#!/bin/sh
uv run alembic upgrade head

uv run python -m scripts.populate

uv run fastapi dev --reload src/main.py --host 0.0.0.0