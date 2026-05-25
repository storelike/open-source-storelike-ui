# publicagent

Public-facing chatbot module for aikit. Provides read-only store access with output filtering and rate limiting.

## Features

- Conversational chatbot backed by the llm-anthropic module
- Read-only access to store FAQ data for context
- No tools exposed to the LLM (prevents any write operations)
- Output filtering: strips code blocks, redacts sensitive patterns, enforces length limits
- In-memory conversation history (max 20 turns, 1-hour session TTL)
- Rate limiting via @fastify/rate-limit
- Audit logging of all chat interactions

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_URL` | No | `http://llm-anthropic:3002` | URL of the llm module |
| `STORE_URL` | No | `http://store-sqlite:3001` | URL of the store module |

## Endpoints

- `GET /health` — Health check
- `POST /chat` — Send a message. Body: `{ session_id, message }`. Returns: `{ reply }`
- `GET /history/:session_id` — Get conversation history (max 20 messages)

## Port

3010
