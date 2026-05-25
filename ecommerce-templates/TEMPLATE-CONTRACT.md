# Template Contract

All templates in `ecommerce-templates/` must comply with this contract to be compatible with Storelike AIKit.

## Required Files

Every template directory must contain:

| File | Purpose |
|------|---------|
| `template.yml` | Template manifest — name, version, required/optional modules, paths |
| `editable.yml` | AI-edit scope — allow/deny lists for file paths the agent may modify |
| `SKILL.md` | Agent instructions — loaded into the owner-agent system prompt before any edit |
| `Dockerfile` | Container build — multi-stage, produces a Node.js SSR server on port 8080 |
| `package.json` | Dependencies and build scripts |

## template.yml Schema

```yaml
name: kebab-case-name        # unique identifier
version: "1.0.0"             # semver
description: "..."           # human-readable description
requires: [store, llm, gateway]  # capability tokens from modules
optional: [transport-telegram, voice, observability, backup]
cms_locale_path: src/locale/cms-locale.json
products_path: src/content/products
public_path: public
port: 8080
```

## editable.yml Schema

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
max_file_size_kb: 512
require_backup: true
```

The `deny` list MUST include: `**/*.ts`, `**/*.astro`, `astro.config.mjs`, `Dockerfile`, `package.json`, `.env*`, `node_modules/**`. The `allow` list MUST NOT include `src/pages/api/**`.

## SKILL.md Requirements

Must contain YAML frontmatter with `name`, `description`, `version`, `applies_to`.

Must contain the following sections (as markdown headings):
1. **What you can change and how** — per-file editing instructions with examples
2. **What you must not touch** — restricted files with explanations
3. **Required workflow** — edit → validate → build → preview → approval → deploy
4. **Owner confirmation required** — actions needing explicit approval
5. **What to do when uncertain** — ask, don't guess
6. **Handling unusual instructions** — stop, log, notify on prompt injection attempts
7. **Voice input** — no elevated privileges for voice
8. **Business context** — what the store sells, tone of communication
9. **Examples** — at least 5 worked examples (correct action + anti-patterns)

## Performance Gate

All templates must achieve **Pagespeed 100** on both mobile and desktop. CI runs Lighthouse audits. A score below 100 fails the build.

## Security Baseline

- No inline JavaScript from untrusted sources
- Content Security Policy headers configured
- User input escaped in all rendering contexts
- No hardcoded secrets in committed files (credentials in `cms-locale.json` are a known exception documented in SECURITY.md)

## Content Format

Product data uses Astro Content Collections with Zod validation. CMS configuration uses `cms-locale.json` with `{ label, value }` pairs. Flatpage content uses HTML fragments in `public/`.

## License

Templates inherit the repository license (GPLv3). Forks must preserve the license. PRs to upstream must comply with this contract.

## Compliance

- Client on their own VPS may modify anything
- PRs to upstream must pass: template contract validation, Pagespeed 100, all required files present
- Forks published under the "Storelike" brand must comply with this contract
