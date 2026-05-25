# Template Contract Specification

## Purpose

This document defines the formal requirements for templates to be compatible with Storelike AIKit. Templates that comply with this contract can be AI-edited, deployed via the runtime, and listed in the marketplace.

## Required Files

| File | Schema | Validation |
|------|--------|------------|
| `template.yml` | `TemplateSchema` from `@aikit/contracts` | Parsed with Zod |
| `editable.yml` | `EditableSchema` from `@aikit/contracts` | Parsed with Zod |
| `SKILL.md` | Frontmatter + 9 required sections | `validateSkill()` + `validateSkillFrontmatter()` |
| `Dockerfile` | Must produce image exposing declared port | Build test |
| `package.json` | Must have `build` script | `npm run build` exit 0 |

## template.yml Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string (kebab-case) | Yes | Unique template identifier |
| `version` | string (semver) | Yes | Template version |
| `description` | string | Yes | Human-readable description |
| `requires` | string[] | No | Required module capabilities |
| `optional` | string[] | No | Optional module capabilities |
| `cms_locale_path` | string | Yes | Relative path to CMS config file |
| `products_path` | string | Yes | Relative path to products directory |
| `public_path` | string | Yes | Relative path to public assets |
| `port` | number | No | Container port (default 8080) |

## editable.yml Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `allow` | string[] | Yes | Glob patterns the AI may write |
| `deny` | string[] | Yes | Glob patterns always blocked |
| `max_file_size_kb` | number | No | Max file size for AI writes (default 512) |
| `require_backup` | boolean | No | Require backup before edit (default true) |

### Mandatory deny patterns

The deny list MUST include all of:
- `**/*.ts`, `**/*.astro`, `astro.config.mjs`
- `Dockerfile`, `package.json`
- `.env*`, `node_modules/**`

### Forbidden allow patterns

The allow list MUST NOT include:
- `src/pages/api/**` (API routes)

## SKILL.md Sections

All required sections as defined in [SKILL-AUTHORING.md](./SKILL-AUTHORING.md).

## Performance Gate

Pagespeed 100 on mobile AND desktop. Tested via Lighthouse in CI. Score below 100 = build failure.

## License

Templates in the upstream repository use GPLv3. Forks preserve the license. PRs to upstream must comply with this full contract.
