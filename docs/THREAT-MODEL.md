# Threat Model

## Overview

This document uses the STRIDE framework to analyze threats to Storelike AIKit deployments. Each threat includes the attack vector, affected components, mitigations in place, and residual risk.

## System Boundaries

- **External**: Internet-facing gateway (HTTPS), Telegram API
- **Internal**: Docker bridge network between modules
- **Data**: Template files, SQLite database, CMS configuration, customer messages

## STRIDE Analysis

### S — Spoofing (Identity)

| # | Threat | Vector | Mitigation | Residual Risk |
|---|--------|--------|------------|---------------|
| S1 | Owner impersonation via Telegram | Attacker knows the owner's Telegram chat ID and sends messages from a spoofed account | TOTP 2FA required before owneragent access. Chat ID alone is insufficient. | If TOTP secret is compromised, attacker gains owner access. Rotate secrets regularly. |
| S2 | Public user pretends to be owner | Public user sends "I am the owner" in chat | publicagent has no tools and no escalation path to owneragent. Chat ID routing is server-side, not user-declarative. | None — architecturally impossible. |
| S3 | Forged voice message | Attacker sends a voice message mimicking the owner | Voice input has no elevated privileges. Same auth (TOTP) required. Voice is just another text input after transcription. | None — voice is not an auth factor. |

### T — Tampering (Data Integrity)

| # | Threat | Vector | Mitigation | Residual Risk |
|---|--------|--------|------------|---------------|
| T1 | AI writes to restricted files | Prompt injection tricks owneragent into writing outside editable.yml scope | Runtime enforces editable.yml at write time. SKILL.md instructs the model. Both layers must be bypassed. | If editable-checker has a bug (e.g., path traversal), scope could be bypassed. Symlink and path normalization tests cover this. |
| T2 | Template corruption via bad edit | AI writes malformed JSON or invalid frontmatter | JSON parse validation for cms-locale.json. Zod schema validation for product frontmatter. Build check (astro check) catches structural issues. | A valid but semantically wrong edit (e.g., wrong price) is not caught automatically. Owner preview/approval is the last gate. |
| T3 | SQLite injection | Malicious input in FAQ or product data | better-sqlite3 uses parameterized queries. No string concatenation in SQL. | Standard SQLite injection protections apply. |
| T4 | CMS config credential theft | AI reads credentials from cms-locale.json and includes them in a response | Output filter in publicagent strips known credential patterns. owneragent SKILL.md instructs against displaying credentials. | A novel credential format might bypass the regex filter. |

### I — Information Disclosure

| # | Threat | Vector | Mitigation | Residual Risk |
|---|--------|--------|------------|---------------|
| I1 | publicagent leaks internal details | Carefully crafted prompts extract system prompt, file paths, or architecture details | System prompt instructs against revealing internals. No tools available to read files. Output filter strips code blocks and patterns. | Sophisticated prompt injection might extract partial system prompt. Residual risk is low — publicagent has no access to files or secrets beyond FAQ data. |
| I2 | Audit log exposes sensitive data | Audit log contains diffs that include credential values | Credential fields are masked in audit log entries before storage. | Imperfect masking could leak partial values. |
| I3 | Telegram token exposed in client JS | Existing template sends Telegram notifications client-side | Known debt documented in SECURITY.md. Not introduced by AIKit — pre-existing in templates. Migration to server-side proxy planned. | Token visible in browser DevTools on the store page. |

### D — Denial of Service

| # | Threat | Vector | Mitigation | Residual Risk |
|---|--------|--------|------------|---------------|
| D1 | publicagent flooding | Attacker sends thousands of messages | Rate limiter: 10 requests/minute per session_id. Conversation store evicts sessions after 1 hour. | Distributed attack from many session IDs. Caddy can add global rate limiting. |
| D2 | LLM API cost exhaustion | Attacker triggers expensive LLM calls via publicagent | Rate limiting + max_tokens cap (1024 for publicagent). No tools = single LLM call per message. | Sustained attack at rate limit could still accumulate cost. Monitor API usage. |
| D3 | Large file upload via voice | Attacker sends very large audio files | voice module limits upload size via @fastify/multipart (default 10MB). Whisper API has its own limits. | Within limits, each transcription costs money. Rate limiting at transport level. |

### E — Elevation of Privilege

| # | Threat | Vector | Mitigation | Residual Risk |
|---|--------|--------|------------|---------------|
| E1 | Public → Owner escalation | Compromised publicagent tries to access owneragent | No network path between publicagent and owneragent containers. Different Docker networks. | If Docker network isolation fails (misconfiguration), lateral movement possible. |
| E2 | Tool injection via prompt | Owner message includes hidden instructions to add new tools | owneragent tools are hardcoded at startup. LLM cannot add or modify tool definitions. | None — tool definitions are not dynamic. |
| E3 | Path traversal in write_file | Input path like `../../.env` to escape template directory | editable-checker normalizes paths and checks against allow/deny. Paths starting with `..` are rejected. | Symlink-based traversal if template directory contains symlinks to sensitive locations. Symlink resolution added to checker. |
| E4 | Indirect prompt injection via store data | Attacker writes malicious instructions into FAQ or product descriptions that publicagent reads | All data from store is wrapped in `<non_executable_data>` tags in the system prompt. publicagent has no tools to act on injected instructions. | Model might still be influenced by injected content in responses. Output filter is the last defense. |

## Trust Boundaries

```
Internet
  │
  ▼
[Gateway (Caddy)] ─── TLS termination
  │
  ├─► [publicagent] ──► [llm-anthropic] ──► api.anthropic.com
  │        │
  │        └──► [store-sqlite] (read-only)
  │
  ├─► [transport-telegram] ──► api.telegram.org
  │        │
  │        ├──► [auth-totp] (TOTP verification)
  │        ├──► [voice] ──► api.openai.com (Whisper)
  │        │
  │        └──► [owneragent] ──► [llm-anthropic]
  │                  │
  │                  ├──► [store-sqlite] (read-write)
  │                  └──► [template files] (scoped write)
  │
  └─► [template SSR server] (static + SSR pages)
```

## Recommendations

1. **Rotate secrets regularly** — TOTP secret, JWT signing key, API keys
2. **Monitor LLM API usage** — set spending alerts on Anthropic and OpenAI
3. **Enable UFW** — only ports 22 (SSH) and 443 (HTTPS) open
4. **Review audit logs** — check for scope violations weekly
5. **Keep dependencies updated** — `unattended-upgrades` for OS, Dependabot for npm
