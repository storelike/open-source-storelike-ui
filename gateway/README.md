# gateway

TLS termination and HTTP routing via Caddy.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DOMAIN` | Yes | Public domain name for automatic TLS |
| `TEMPLATE_UPSTREAM` | No | Template server upstream (default: `basic:8080`) |

## Routing Table

| Path | Upstream |
|---|---|
| `/api/public/*` | `publicagent:3010` |
| `/api/owner/*` | `owneragent:3011` |
| `/webhook/telegram` | `transport-telegram:3004` |
| `/*` (default) | `{TEMPLATE_UPSTREAM}` (default `basic:8080`) |

## Docker

```bash
docker build -t gateway .
docker run -p 443:443 -p 80:80 -e DOMAIN=example.com gateway
```
