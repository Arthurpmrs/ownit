# Ownit - Backend

Código fonte do backend.

## Setup do ambiente de desenvolvimento

1. Instale o [uv](https://docs.astral.sh/uv/getting-started/installation/).

2. Instale as dependências localmente (provavelmente também será instalada uma versão do Python 3.14).

```bash
uv sync
```

3. Configure seu editor.

Para o VSCode sugerimos as seguintes extensões.

- [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
- [Ruff](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)

Depois disso, selecione o Ambiente Virtual no VScode no canto inferior direito.

Para habilitar a formatação automática ao salvar, adicione o código abaixo ao seu `settings.json`.

```json
"[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": "explicit",
    },
},
```

4. Inicialize o banco de dados usando o Docker. Na pasta raiz do projeto use os seguintes comandos.

```bash
cp .env.example .env
docker compose up
```

5. Execute as migrações.

```bash
uv run alembic upgrade head
```

6. Inicialize a aplicação.

```bash
uv run fastapi dev --reload src/main.py
```

## Criando migrações
Depois de criar ou atualizar uma tabela siga os seguintes passos.

1. Se estiver criando um novo arquivo `tables.py` para uma nova feature, adicione o import do novo arquivo em `migrations/env.py`.

```python
...
from src.features.new_feature import tables  # noqa

...
```

2. Crie a migration.

```bash
uv run alembic revision --autogenerate -m "mensagem pertinente"
```

3. Verifique manualmente a migration gerada em `micrations/versions`.

4. Aplique na nova migration.

```bash
uv run alembic upgrade head
```

## Comandos úteis

```bash
# Verificar o código
uv run ruff check ./src && uv run ruff check ./src --diff

# Corrigir e formatar o código
uv run ruff check ./src --fix && uv run ruff format ./src
```

## Testes

Os testes foram configurados para usar Testcontainers, ou seja, é necessário que o Docker esteja ativo para rodar os testes. O comando para executar os testes é apresentado abaixo.

```bash
uv run pytest tests
```

> [!NOTE]
> Para usuários de algumas distros linux, pode ser que o Testcontainers exija [privilégios liberados do socket do Docker](https://docs.docker.com/engine/install/linux-postinstall/). Caso não queira liberar uso do docker para usuário que não seja root, uma alternativa é usar o Podman. Antes de executar os testes, configure as seguintes variáveis de ambiente:
>
> - `export TESTCONTAINERS_RYUK_DISABLED=true`
> - `export DOCKER_HOST=unix:///run/user/1000/podman/podman.sock`
> 
> Isso fará com que o Testcontainers use o socket do Podman.
