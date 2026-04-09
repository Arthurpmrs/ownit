# ============================================
# BASE: Install dependencies
# ============================================
FROM node:24-bookworm-slim AS base

WORKDIR /app

COPY ./package.json ./package-lock.json /app/

RUN npm ci --include=dev


# ============================================
# DEV: Hot reload
# ============================================
FROM node:24-bookworm-slim AS dev

WORKDIR /app

COPY --from=base /app/node_modules /app/node_modules

COPY . /app/

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]


# ============================================
# BUILD: Builds for production
# ============================================
FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY --from=base /app/node_modules /app/node_modules

COPY . /app/

RUN npm run build
