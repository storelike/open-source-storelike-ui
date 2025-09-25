FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# RUN npm ci
RUN npm i
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# RUN npm ci --only=production
RUN npm i --only=production
EXPOSE 8080
CMD ["node", "./dist/server/entry.mjs"]