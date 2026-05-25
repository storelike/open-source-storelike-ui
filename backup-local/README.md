# backup-local

Scheduled local backups of template files and SQLite database.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BACKUP_INTERVAL_CRON` | No | `0 2 * * *` | Cron schedule for automatic backups |
| `BACKUP_RETAIN_DAYS` | No | `7` | Days to keep old backups |
| `TEMPLATES_BASE_PATH` | Yes | `/templates` | Path to templates directory |
| `STORE_URL` | No | `http://store-sqlite:3001` | Store module URL |

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/backups` | List available backups |
| POST | `/backup` | Trigger immediate backup |

## Storage

Backups are stored as `.tar.gz` files in the `/backups` volume. Old backups are automatically pruned based on `BACKUP_RETAIN_DAYS`.
