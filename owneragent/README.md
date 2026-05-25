# owneragent

Owner agent module for aikit. Provides authenticated template-editing capabilities through an agentic LLM loop with tools.

## Features

- Authenticated access via auth-totp token validation
- SKILL.md loading and enforcement per template
- Editable file checker (allow/deny lists via editable.yml or defaults)
- Agentic loop: LLM calls tools iteratively until the task is complete
- Audit logging of all file writes and CMS updates

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_URL` | No | `http://llm-anthropic:3002` | URL of the llm module |
| `STORE_URL` | No | `http://store-sqlite:3001` | URL of the store module |
| `AUTH_URL` | No | `http://auth-totp:3003` | URL of the auth module |
| `TEMPLATES_BASE_PATH` | Yes | `/templates` | Absolute path to ecommerce-templates directory |

## Endpoints

- `GET /health` -- Health check
- `POST /chat` -- Send a message. Body: `{ session_id, message, auth_token, template? }`. Returns: `{ reply, actions? }`

## Tools

| Tool | Description |
|------|-------------|
| `read_file` | Read a file from the template (respects allow list) |
| `write_file` | Write a file to the template (respects allow/deny lists, logs to audit) |
| `list_products` | List all product .md files with slug and title |
| `get_cms_locale` | Read cms-locale.json (full section or summary view) |
| `update_cms_locale` | Update a specific key in a section of cms-locale.json |
| `create_product` | Create a new product .md file with validated frontmatter |
| `update_product` | Update an existing product's frontmatter fields |

## SKILL.md Loading Flow

1. Client sends `POST /chat` with `template` field (e.g., "basic")
2. Server resolves template path: `TEMPLATES_BASE_PATH/basic`
3. Reads `SKILL.md` from template root
4. Validates frontmatter (name, description, version, applies_to)
5. Validates required sections (Overview, Editable Files, Constraints)
6. Appends SKILL.md content to the system prompt
7. If SKILL.md is missing or invalid, logs a warning and proceeds with default constraints

## Port

3011
