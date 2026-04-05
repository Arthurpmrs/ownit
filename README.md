# Ownit

## Executar o sistema localmente via Docker

Para executar o sistema localmente 100% pelo Docker, use os comandos a seguir.
```bash
# Crie o .env
cp .env.example .env

# Execute o sistema usando o Docker
docker compose up
```

## Executar o sistema localmente sem Docker

Para executar os serviços diretamente no host sem usar o Docker, siga os seguintes passos a seguir.

1. Criar o arquivo `.env` com base em `.env.example`

2. Substituir valor da variável DATABASE_URL por `"postgresql+psycopg://ownit_admin:ownit_admin@localhost:5432/ownit_dev"`

3. Subir o banco de dados via Docker

```bash
docker compose up pgsql
```

4. Subir o backend

```bash
cd api
uv run fastapi dev --reload src/main.py
```
5. Copiar o arquivo `.env` para dentro de `ui/` (não é necessário para o Docker, mas para rodar diretamente é)

6. Subir o frontend

```bash
cd ui
npm run dev
```

Obs: Siga as instruções de `ui/README.md` e `api/README.md` para configurar o ambiente de desenvolvimento.