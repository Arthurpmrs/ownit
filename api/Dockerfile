# ============================================
# BASE: Install dependencies
# ============================================
FROM python:3.14-bookworm AS base

RUN groupadd --system -g 1000 ownitgroup
RUN useradd --system -g 1000 -u 1000 --create-home ownit

ENV PYTHONUNBUFFERED=1
WORKDIR /app/

COPY --from=ghcr.io/astral-sh/uv:0.11.3 /uv /uvx /bin/

ENV PATH="/app/.venv/bin:$PATH"
ENV UV_TOOL_BIN_DIR=/usr/local/bin
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_NO_DEV=1

COPY --chown=ownit:ownit ./pyproject.toml ./uv.lock /app/

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project

# ============================================
# DEV: Hot reload
# ============================================
FROM base AS dev

COPY --chown=ownit:ownit ./entrypoint.sh ./alembic.ini /app/

EXPOSE 8000

USER ownit

CMD [".venv/bin/fastapi", "run", "src/main.py", "--host", "0.0.0.0"]


# ============================================
# PROD
# ============================================
FROM base AS prod

COPY . /app/

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

EXPOSE 8000

USER ownit

CMD ["/app/.venv/bin/fastapi", "run", "/app/src/main.py", "--host", "0.0.0.0", "--workers", "4"]
