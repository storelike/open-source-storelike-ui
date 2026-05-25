# observability-loki

Log aggregation module using Grafana Loki.

## Overview

Collects and stores logs from all AIKit modules. Other modules can ship logs via the Loki push API at `http://observability-loki:3100/loki/api/v1/push`.

## Configuration

No environment variables required. Logs are stored locally in the `loki-data` Docker volume with a 7-day retention period.

## Integration

Modules using Fastify with pino can add `pino-loki` as a transport:

```typescript
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-loki',
    options: {
      host: 'http://observability-loki:3100',
      batching: true,
      interval: 5,
    },
  },
});
```

## Querying Logs

Use LogQL queries via the Loki API:

```bash
curl -G 'http://localhost:3100/loki/api/v1/query_range' \
  --data-urlencode 'query={module="owneragent"}' \
  --data-urlencode 'limit=100'
```
