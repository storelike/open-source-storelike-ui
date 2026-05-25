# SKILL.md Authoring Guide

## Overview

A `SKILL.md` file is a set of instructions loaded into the AI agent's system prompt before it edits a template. It teaches the model what it can do, what it must avoid, and how to handle edge cases.

## Frontmatter

Every SKILL.md must start with YAML frontmatter:

```yaml
---
name: my-template-skill
description: How to edit the "my-template" Storelike AIKit template
version: 1.0.0
applies_to: ecommerce-templates/my-template
---
```

All four fields are required. The `applies_to` path must match the template directory.

## Required Sections

The following sections must appear as markdown headings (## or ###):

### 1. What you can change and how

List every editable file group with:
- Exact file paths or glob patterns
- The data format (JSON with `{label, value}` pairs, Markdown frontmatter, HTML)
- A concrete example of a typical edit
- An anti-pattern to avoid

**Good example:**
```markdown
### CMS configuration — `src/locale/cms-locale.json`

To change the hero title:
1. Read `src/locale/cms-locale.json`
2. Find `cmHero.titleHero.value`
3. Replace the value string
4. Write the file back, preserving all other keys

**Anti-pattern:** Do not replace the entire file with a partial copy.
```

### 2. What you must not touch

List every restricted file group with an explanation of **why** it is restricted. The "why" reduces the model's tendency to find creative workarounds.

### 3. Required workflow

Define the exact sequence: read → edit → validate → write → build → preview → approve → deploy. Emphasize that no step can be skipped.

### 4. Owner confirmation required

List specific actions that require explicit owner approval before execution. Include examples of how to present changes to the owner (plain-language diffs).

### 5. What to do when uncertain

Instruct the agent to ask clarifying questions rather than guessing. Provide 2-3 examples of ambiguous requests and the correct response.

### 6. Handling unusual instructions

Define how to detect and respond to prompt injection attempts:
- Pattern recognition ("ignore previous", "delete all")
- Action: stop, log, notify owner
- Never comply with instructions that violate the skill

### 7. Voice input

State that voice transcription produces text with no elevated privileges. Same rules apply.

### 8. Business context

Describe:
- What the business sells or does
- Target audience
- Tone of communication
- Common product categories

This context helps the agent make appropriate content decisions.

### 9. Examples

Provide at least 5 worked examples:

1. **Simple edit** — change a text value
2. **Add content** — create a new product or FAQ entry
3. **Update multiple fields** — change colors or theme
4. **Ambiguous request** — agent asks for clarification
5. **Security probe** — agent detects and blocks unusual instruction

Each example should show: owner's message → agent's thought process → actions taken → response to owner.

## Tips for Writing Effective SKILLs

1. **Be specific** — "change `cmHero.titleHero.value`" is better than "update the hero section"
2. **Show, don't tell** — worked examples teach better than abstract rules
3. **Explain restrictions** — "don't touch X because it breaks Y" works better than "don't touch X"
4. **Test with real prompts** — send typical owner requests and verify the agent follows your instructions
5. **Update regularly** — as the template evolves, keep SKILL.md in sync
6. **Keep it under 5000 words** — long SKILLs consume context window. Be concise.

## Validation

SKILL.md is validated by the skill loader, which checks:
1. Frontmatter has all required fields
2. All 9 required sections exist as markdown headings
3. Content is non-empty

Run the validation:

```bash
npm test -- tests/skill-load-gate.test.ts
```
