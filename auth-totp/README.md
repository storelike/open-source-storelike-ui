# auth-totp

TOTP 2FA verification with JWT session tokens.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TOTP_SECRET` | Yes | Base32-encoded TOTP secret |
| `SESSION_SECRET` | Yes | Secret for signing JWT session tokens |
| `SESSION_TTL_SECONDS` | No | Token TTL in seconds (default: `3600`) |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/verify` | Verify TOTP code, returns JWT (`{ code }`) |
| POST | `/validate` | Validate JWT token (`{ token }`) |

## Usage

```bash
npm install
npm run build
TOTP_SECRET=JBSWY3DPEHPK3PXP SESSION_SECRET=mysecret npm start
```
