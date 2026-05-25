FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && apk del python3 make g++

COPY --from=builder /app/dist ./dist

RUN mkdir -p /data

ENV DB_PATH=/data/store.db
EXPOSE 3001

CMD ["node", "dist/index.js"]
