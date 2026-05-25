# store-sqlite

SQLite-backed HTTP API for FAQ, product catalog cache, and audit logs.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_PATH` | No | Filesystem path to SQLite database file (default `/data/store.db`) |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/faq` | List all FAQ entries |
| POST | `/faq` | Create FAQ entry (`{ question, answer, source? }`) |
| GET | `/products` | List all products |
| POST | `/products` | Upsert product (`{ id, title, price, category?, is_active?, data? }`) |
| GET | `/audit?limit=50&offset=0` | Paginated audit log |
| POST | `/audit` | Append audit entry (`{ actor, action, target?, diff? }`) |

## Usage

```bash
npm install
npm run build
npm start
```
