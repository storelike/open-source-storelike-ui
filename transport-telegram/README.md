# transport-telegram

Telegram bot transport for text and voice messages. Routes messages to publicagent or owneragent based on chat ID and authentication state.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram bot token from BotFather |
| `OWNER_CHAT_ID` | Yes | Telegram chat ID of the store owner |
| `PUBLICAGENT_URL` | No | URL of publicagent (default: `http://publicagent:3010`) |
| `OWNERAGENT_URL` | No | URL of owneragent (default: `http://owneragent:3011`) |
| `AUTH_URL` | No | URL of auth-totp (default: `http://auth-totp:3003`) |
| `VOICE_URL` | No | URL of voice module (default: `http://voice:3005`) |

## Routing Logic

1. If the sender's chat ID matches `OWNER_CHAT_ID` and the session holds a valid auth token, the message is routed to **owneragent**.
2. If the sender's chat ID matches `OWNER_CHAT_ID` but there is no valid auth token, the bot prompts for a TOTP code and verifies it against the auth-totp service.
3. All other messages are routed to **publicagent**.

## Voice Messages

When the bot receives a voice message it downloads the audio file from Telegram, sends it to the voice module for transcription, and then routes the resulting text through the same routing logic as text messages.

## Development

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t transport-telegram .
docker run -e TELEGRAM_BOT_TOKEN=... -e OWNER_CHAT_ID=... transport-telegram
```
