FROM node:22-alpine AS build

WORKDIR /app

ARG PUBLIC_SITE_URL=https://replace-with-container-id.containers.yandexcloud.net
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.28-alpine AS runtime

ENV PORT=8080

COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider "http://127.0.0.1:${PORT}/health" || exit 1
