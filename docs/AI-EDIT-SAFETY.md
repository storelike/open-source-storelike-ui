# AI-Edit Safety

## Overview

When an AI agent edits template files, three layers of protection ensure safety:

1. **Directive layer** — SKILL.md tells the model what to do and what not to do
2. **Technical layer** — editable.yml + runtime enforcement blocks unauthorized writes
3. **Process layer** — preview → approval → deploy workflow prevents unreviewed changes

All three layers must be in place. SKILL.md without editable.yml is a recommendation the model might ignore. editable.yml without SKILL.md is a technical block without context for the model to understand why.

## Layer 1: SKILL.md (Directive)

Every template has a `SKILL.md` file that the owneragent loads into its system prompt before any template work. This file contains:

- **What can be changed** — specific files and fields with examples
- **What must not be touched** — restricted files with explanations of why
- **Required workflow** — the sequence of steps for every edit
- **When to ask for clarification** — ambiguous requests trigger questions, not guesses
- **Unusual instruction handling** — prompt injection attempts trigger a stop + alert

### Skill Load Gate

The runtime refuses to provide template-editing tools to the owneragent unless SKILL.md is loaded. The enforcement flow:

1. Owner sends a message mentioning a template edit
2. owneragent requests template/* tools from runtime
3. Runtime checks: is SKILL.md loaded in the current context?
4. If not → runtime loads SKILL.md into the system prompt, validates required sections
5. If SKILL.md is missing or invalid → runtime refuses tools, returns error to owner
6. If loaded and valid → tools are available

This means a template without SKILL.md cannot be edited by the AI agent at all.

## Layer 2: editable.yml (Technical Enforcement)

Every template has an `editable.yml` declaring which file paths the AI may write:

```yaml
allow:
  - "src/locale/cms-locale.json"
  - "src/content/products/*.md"
  - "public/fragment*.html"
  - "public/images-product/**"
deny:
  - "**/*.ts"
  - "**/*.astro"
  - "package.json"
  - "Dockerfile"
  - ".env*"
  - "node_modules/**"
```

### Enforcement Rules

1. **Deny always wins** — if a path matches both allow and deny, it is blocked
2. **Default deny** — paths matching neither allow nor deny are blocked
3. **Path normalization** — `../` sequences are resolved before matching. No path traversal.
4. **Symlink resolution** — symbolic links are resolved to their real path before checking
5. **Every write goes through the checker** — the `write_file` tool handler calls `isAllowed()` before any filesystem operation

### What the AI Can Edit

| Template File | Why Allowed |
|--------------|-------------|
| `src/locale/cms-locale.json` | All site text, theming, SEO, navigation — the primary customization surface |
| `src/locale/locale_text_site.json` | UI text strings |
| `src/content/products/*.md` | Product catalog — frontmatter validated by Zod |
| `public/fragment*.html` | Flatpage content (About, Privacy Policy, etc.) |
| `public/images-product/**` | Product images |
| `public/images-site/**` | Site images |

### What the AI Cannot Edit

| File Pattern | Why Denied |
|-------------|-----------|
| `**/*.ts`, `**/*.tsx` | Application source code — changes break functionality |
| `**/*.astro` | Page and component templates — changes break rendering |
| `astro.config.mjs` | Build configuration — changes break the build |
| `package.json` | Dependencies — changes break installation |
| `Dockerfile` | Container build — changes break deployment |
| `.env*` | Secrets — must not be written by AI |
| `src/pages/api/**` | Server-side endpoints — changes break SSR |
| `src/layouts/**` | Page layouts — changes break structure |
| `src/components/**` | UI components — changes break the interface |

## Layer 3: Process (Preview → Approval → Deploy)

Every edit follows a mandatory workflow:

```
Owner request
    │
    ▼
Read current file state
    │
    ▼
Apply changes
    │
    ▼
Validate (JSON parse / Zod schema)
    │
    ▼
Write file (editable.yml check)
    │
    ▼
Build check (astro check && astro build)
    │     │
    │     └── FAIL → revert, notify owner with diff + error
    │
    ▼
Lighthouse check (Pagespeed 100)
    │     │
    │     └── FAIL → revert, notify owner with diff + score
    │
    ▼
Preview (separate port/subdomain)
    │
    ▼
Owner reviews diff in plain language
    │
    ▼
Owner approves → Deploy to production
```

### Automatic Backup

Before any write operation, the current state of the file is backed up. If `backup-local` or `backup-s3` module is installed, backups are stored there. Otherwise, an in-memory snapshot is kept for the duration of the edit session.

### Rollback

The owner can say "rollback" at any time to revert to the last successful build. Rollback:
1. Restores files from the most recent backup
2. Runs a build check to verify the restored state
3. Deploys the restored state to production
4. Logs the rollback in the audit log

### Audit Trail

Every edit is logged with:
- Timestamp
- Owner's original request (text or transcribed voice)
- Files changed (paths + diffs)
- Validation results (JSON/Zod/build/Lighthouse)
- Approval status
- Deploy result

## Anomaly Detection

If the owneragent detects unusual patterns, it enters a safety mode:

**Triggers:**
- 3+ scope violations within 5 minutes
- Instructions containing "ignore previous", "delete all", or similar patterns
- Requests to expose secrets or send data to external addresses

**Response:**
1. Enter read-only mode (no write_file or deploy operations)
2. Log the anomaly with full context
3. Notify the owner: "I detected unusual activity and paused all editing. Please verify via TOTP to resume."
4. Require fresh TOTP authentication to exit safety mode

## Testing

The following tests verify AI-edit safety:

| Test | What It Checks |
|------|---------------|
| `skill-load-gate.test.ts` | owneragent cannot access template/* tools without a valid SKILL.md |
| `ai-edit-scope.test.ts` | write_file rejects paths outside editable.yml; deny overrides allow; path traversal blocked |
| `isolation.test.ts` | publicagent has no write tools; no network path to owneragent |
| `voice-path.test.ts` | Voice input produces the same result as text input with no elevated privileges |
