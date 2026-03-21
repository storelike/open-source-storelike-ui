# Стадия сборки
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --prefer-offline

COPY . .
RUN npm run build

# Финальная стадия
FROM node:20-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --prefer-offline

COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["node", "./dist/server/entry.mjs"]