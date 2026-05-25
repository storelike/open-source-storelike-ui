import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateSkill, validateSkillFrontmatter } from '../core/contracts/src/skill.schema.js';

const ROOT = join(import.meta.dirname, '..');

describe('Skill load gate', () => {
  it('basic SKILL.md passes validation', () => {
    const content = readFileSync(join(ROOT, 'ecommerce-templates/basic/SKILL.md'), 'utf-8');
    const result = validateSkill(content);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('web-folio SKILL.md passes validation', () => {
    const content = readFileSync(join(ROOT, 'ecommerce-templates/web-folio/SKILL.md'), 'utf-8');
    const result = validateSkill(content);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it('valid frontmatter is accepted', () => {
    const content = `---
name: test-skill
description: Test skill
version: 1.0.0
applies_to: ecommerce-templates/test
---

# Test`;
    expect(validateSkillFrontmatter(content).valid).toBe(true);
  });

  it('missing frontmatter is rejected', () => {
    const content = '# No frontmatter here';
    expect(validateSkillFrontmatter(content).valid).toBe(false);
  });

  it('missing frontmatter field is rejected', () => {
    const content = `---
name: test
description: Test
---
# Incomplete`;
    const result = validateSkillFrontmatter(content);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('version');
  });

  it('SKILL.md with missing sections fails validation', () => {
    const content = `---
name: test
description: Test
version: 1.0.0
applies_to: test
---

## What you can change and how
Some content

## What you must not touch
Some content
`;
    const result = validateSkill(content);
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.missing).toContain('Required workflow');
  });

  it('SKILL.md with all sections passes', () => {
    const content = `---
name: test
description: Test
version: 1.0.0
applies_to: test
---

## What you can change and how
Content

## What you must not touch
Content

## Required workflow
Content

## Owner confirmation required
Content

## What to do when uncertain
Content

## Handling unusual instructions
Content

## Voice input
Content

## Business context
Content

## Examples
Content
`;
    const result = validateSkill(content);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });
});
