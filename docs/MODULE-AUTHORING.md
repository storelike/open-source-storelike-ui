# Module Authoring Guide

## Overview

A module is a self-contained service that provides a specific capability to the Storelike AIKit platform. Modules are identified by the presence of a `module.yml` manifest in their root directory.

## Directory Structure

```
my-module/
  module.yml          # Required — manifest
  Dockerfile          # Required — container build
  package.json        # Required for Node.js modules
  tsconfig.json       # Required for TypeScript modules
  src/
    index.ts          # Entry point
  README.md           # Required — documentation
```

## Step-by-Step

### 1. Create the directory

Place your module at the repository root:

```bash
mkdir my-module && cd my-module
```

### 2. Write module.yml

```yaml
name: my-module
version: 1.0.0
description: What this module does
category: transport          # agent | gateway | store | transport | auth | observability | broker | backup | llm | voice
provides: [my-capability]    # capability tokens this module offers
requires: [store, llm]       # capabilities it depends on
port: 3020                   # HTTP port (3000-3999 for modules, 443 for gateway)
healthcheck:
  path: /health
  port: 3020
env:
  MY_API_KEY:
    required: true
    description: API key for the external service
    secret: true
  MY_OPTION:
    required: false
    description: "Optional setting (default: some-value)"
    secret: false
egress:
  - api.example.com           # Domains this module needs to reach
compose:
  build: ./my-module
  volumes:
    - my-module-data:/data    # Optional persistent storage
  networks: [aikit]
author: Your Name
repository: https://github.com/you/my-module
```

### 3. Write the Dockerfile

Use multi-stage builds with `node:22-alpine`:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --omit=dev
EXPOSE 3020
CMD ["node", "dist/index.js"]
```

### 4. Implement the health endpoint

Every module MUST expose a health check endpoint:

```typescript
app.get('/health', async () => {
  return { status: 'ok' };
});
```

### 5. Register your capabilities

The `provides` array in `module.yml` declares what your module offers. Other modules can `require` these capabilities. Standard capability tokens:

| Token | Meaning |
|-------|---------|
| `store` | Data persistence |
| `llm` | Language model API |
| `auth` | Authentication |
| `gateway` | HTTP routing + TLS |
| `voice` | Speech-to-text |
| `publicagent` | Public chatbot |
| `owneragent` | Owner agent |
| `transport-telegram` | Telegram messaging |
| `observability` | Logging/metrics |
| `backup` | Data backup |

You can define custom capability tokens for new module categories.

### 6. Handle secrets properly

- Mark all sensitive env vars with `secret: true` in `module.yml`
- Never log secret values
- Never include secrets in error messages or API responses
- Use env vars, not hardcoded strings

### 7. Write tests

Your module should pass the module contract test (`tests/module-contract.test.ts`), which validates:
- `module.yml` exists and parses against the schema
- `Dockerfile` exists
- `README.md` exists
- `src/index.ts` exists (for Node.js modules)
- Secret env vars are marked correctly

## Validation

Run the contract test:

```bash
npm test -- tests/module-contract.test.ts
```

Generate the compose file to verify your module integrates:

```bash
node core/runtime/dist/index.js generate
```

## Publishing

1. Create a GitHub repository for your module
2. Ensure `module.yml` is at the root
3. Users can install by cloning into their AIKit root directory
4. The runtime scanner will automatically detect it
