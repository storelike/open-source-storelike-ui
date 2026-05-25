# Template Authoring Guide

## Overview

Templates are Astro-based web applications in `ecommerce-templates/`. To make a template compatible with Storelike AIKit's AI-editing capabilities, add three manifest files.

## Required Files

| File | Purpose |
|------|---------|
| `template.yml` | Declares template metadata and module dependencies |
| `editable.yml` | Defines which files the AI agent may modify |
| `SKILL.md` | Instructions for the AI agent on how to edit this template |

## Step-by-Step

### 1. Create template.yml

```yaml
name: my-template
version: 1.0.0
description: Description of what this template is for
requires:
  - store
  - llm
  - gateway
optional:
  - transport-telegram
  - voice
  - observability
  - backup
cms_locale_path: src/locale/cms-locale.json
products_path: src/content/products
public_path: public
port: 8080
```

- `requires` lists capability tokens that MUST be installed for the template to function
- `optional` lists capabilities that enhance the template but are not required
- Paths are relative to the template root

### 2. Create editable.yml

Decide which files the AI agent should be able to modify:

```yaml
allow:
  - "src/locale/cms-locale.json"       # Site configuration
  - "src/content/products/*.md"        # Product catalog
  - "public/fragment*.html"            # Flatpage content
  - "public/images-product/**"         # Product images
  - "public/images-site/**"            # Site images

deny:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.astro"
  - "**/*.mjs"
  - "**/*.js"
  - "package.json"
  - "package-lock.json"
  - "tsconfig.json"
  - "Dockerfile"
  - ".dockerignore"
  - ".env*"
  - "node_modules/**"
  - "dist/**"
  - ".astro/**"
  - "src/layouts/**"
  - "src/pages/**"
  - "src/components/**"

max_file_size_kb: 512
require_backup: true
```

**Rules:**
- Only allow data files (JSON, Markdown, HTML fragments, images)
- Always deny source code files (`.ts`, `.tsx`, `.astro`, `.mjs`, `.js`)
- Always deny build/deploy config (`package.json`, `Dockerfile`, `tsconfig.json`)
- Always deny secret files (`.env*`)
- Deny overrides allow — if a path matches both, it is blocked

### 3. Create SKILL.md

See [SKILL-AUTHORING.md](./SKILL-AUTHORING.md) for the full specification.

### 4. Validate

Run the template contract test:

```bash
npm test -- tests/template-contract.test.ts
```

This checks:
- All three files exist and parse correctly
- `editable.yml` deny list includes required patterns
- `SKILL.md` has all required sections
- Paths declared in `template.yml` exist in the template

## Performance Gate

Every template must achieve Pagespeed 100 on both mobile and desktop. The CI runs Lighthouse audits. AI edits that degrade performance below 100 will be blocked before deployment.

## Content Format

Templates use two main data formats:
- **cms-locale.json** — site configuration with `{ label, value }` pairs
- **Content Collections** — Markdown files with YAML frontmatter, validated by Zod
