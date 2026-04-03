# Ownit - Frontend

Código fonte do frontend.

## Setup do ambiente de desenvolvimento

1. Instale a versão 24 do [NodeJS](https://nodejs.org/en/download).

2. Instale as dependências localmente

```bash
npm install
```

3. Configure seu editor.

Para o VSCode sugerimos as extensões:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Configuração para formatar ao salvar. Adicione o código abaixo ao seu `settings.json`

```json
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
},
```

## Comandos

- Para executar localmente: `npm run dev`
- Para executar o lint: `npm run lint`
- Para verificar arquivos que violam a formatação: `npm run format:check`
- Para formatar arquivos: `npm run format`

## Informações adicionais

O roteamento é feito usando a biblioteca [TanStack Router](https://tanstack.com/router/latest/docs/routing/routing-concepts). A estrutura das rotas é definida pela pastas e arquivos dentro de `src/routes`. Quando o código é executado com `npm run dev`, a biblioteca gera/modifica o arquivo `routeTree.gen.ts`, responsável por tornar as rotas typesafe. Quando criar uma nova rota, rode o sistema para atualizar o `routeTree.gen.ts`.

Outras bibliotecas utilizadas:

- [Mantine](https://mantine.dev/core/package/)
- [TanStack Router](https://tanstack.com/query/v5/docs/framework/react/quick-start)
- [D&D Kit](https://dndkit.com/react/quickstart)
