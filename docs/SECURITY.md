# Security

## Overview

Storelike AIKit uses defense-in-depth to protect store owner data, customer interactions, and template integrity. Security is enforced at multiple layers: network isolation, authentication, scope enforcement, and audit logging.

## Network Isolation

All modules run as Docker containers on an internal `aikit` bridge network. Only the `gateway` module exposes ports externally (443/tcp for HTTPS, 80/tcp for HTTP→HTTPS redirect).

### Agent Separation

`publicagent` and `owneragent` are completely isolated:

| Property | publicagent | owneragent |
|----------|-------------|------------|
| Network access | aikit (read-only to store) | aikit (read-write to store, template volume) |
| LLM tools | None (no `tools` parameter) | template/*, store/* |
| Authentication | None (public) | TOTP + JWT |
| Store access | Read-only (GET /faq, GET /products) | Read-write (all endpoints) |
| Template files | No access | Read-write within editable.yml scope |

There is no direct network path between publicagent and owneragent. They communicate only through the shared store (one writes, the other reads).

## Authentication

### Owner Authentication Flow

1. Owner sends a message via Telegram to the owner bot
2. `transport-telegram` checks if the chat ID matches `OWNER_CHAT_ID`
3. If no active session, prompts for TOTP code
4. TOTP code is verified by `auth-totp` module
5. On success, `auth-totp` issues a JWT with configurable TTL (default 1 hour)
6. JWT is attached to all subsequent owneragent requests
7. `owneragent` validates the JWT on every request via `auth-totp POST /validate`

### Public Access

Public users interact with `publicagent` through the public Telegram bot or webchat. No authentication is required. Rate limiting (10 requests/minute per session) prevents abuse.

## Secret Management

### Environment Variables

All secrets are passed as environment variables, never hardcoded in source code:

| Secret | Module | Env Var |
|--------|--------|---------|
| Anthropic API key | llm-anthropic | `ANTHROPIC_API_KEY` |
| OpenAI API key (Whisper) | voice | `OPENAI_API_KEY` |
| Telegram bot token | transport-telegram | `TELEGRAM_BOT_TOKEN` |
| TOTP secret | auth-totp | `TOTP_SECRET` |
| JWT signing key | auth-totp | `SESSION_SECRET` |

In Docker Compose, use `env_file` or Docker secrets. Never commit `.env` files with real values.

### Known Issue: cms-locale.json Credentials

The existing templates store some credentials directly in `src/locale/cms-locale.json`:
- `cmAppConfig.tokenTelegram` — Telegram bot token for order notifications
- `cmAppConfig.chatIdTelegram` — Telegram chat ID
- `cmAppConfig.tinkoffTerminalKey` — Payment terminal key
- `cmAppConfig.passwordAdmin` — Admin password (plaintext)

**This is a known security debt.** These values are used client-side by React components for direct Telegram API calls. Migration to server-side proxying is planned for iteration 2. Until then:
- Do not expose `cms-locale.json` to public-agent context
- The `editable.yml` allows AI editing of this file — the owner-agent can update these values but must not display them in chat responses

## TLS

The `gateway` module uses Caddy, which automatically provisions TLS certificates from Let's Encrypt. No manual certificate management is required. Set the `DOMAIN` environment variable to your public domain.

## AI-Edit Safety

See [AI-EDIT-SAFETY.md](./AI-EDIT-SAFETY.md) for the three-layer safety model protecting template files from unauthorized AI modifications.

## Egress Control

Each module declares an `egress` allowlist in its `module.yml`. In production, iptables OUTPUT rules should restrict each container to only the declared domains:

- `llm-anthropic`: `api.anthropic.com`
- `voice`: `api.openai.com`
- `transport-telegram`: `api.telegram.org`
- `gateway`: `acme-v02.api.letsencrypt.org` (for TLS certs)
- All other modules: internal network only

## Incident Response

### Killswitch

The runtime API exposes a killswitch endpoint that stops all modules within 2 seconds:
```bash
curl -X POST http://localhost:9090/killswitch -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Anomaly Detection

If the owneragent detects multiple scope violations or unusual instruction patterns within a short timeframe, it enters read-only mode and notifies the owner via a separate channel.

### Audit Log

Every action is logged to `store-sqlite` audit_log table:
- Timestamp
- Actor (publicagent / owneragent / system)
- Action (read / write / deploy / rollback)
- Target (file path or resource)
- Diff (for write operations)

Query audit logs: `GET /audit?limit=50&offset=0`
