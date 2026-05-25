# voice

Speech-to-text via OpenAI Whisper API.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key for Whisper |

## API

### GET /health

Returns `{ "status": "ok" }`.

### POST /transcribe

Accepts `multipart/form-data` with an `audio` field containing the audio file.

Returns `{ "text": "transcribed text" }`.

## Development

```bash
npm install
npm run dev
```

## Build and Run

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t voice .
docker run -p 3005:3005 -e OPENAI_API_KEY=sk-... voice
```
