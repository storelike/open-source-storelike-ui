# llm-anthropic

Thin HTTP wrapper around the Anthropic Claude SDK.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `LLM_MODEL` | No | Model ID (default: `claude-sonnet-4-20250514`) |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/chat` | Send chat request (`{ messages, system?, tools?, max_tokens? }`) |

## Usage

```bash
npm install
npm run build
ANTHROPIC_API_KEY=sk-ant-... npm start
```
