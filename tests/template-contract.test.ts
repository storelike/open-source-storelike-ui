import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { TemplateSchema } from '../core/contracts/src/template.schema.js';
import { EditableSchema } from '../core/contracts/src/editable.schema.js';
import { validateSkill, validateSkillFrontmatter } from '../core/contracts/src/skill.schema.js';

const ROOT = join(import.meta.dirname, '..');
const TEMPLATES_DIR = join(ROOT, 'ecommerce-templates');

const TEMPLATE_DIRS = ['basic', 'web-folio'];

describe('Template contract validation', () => {
  for (const templateName of TEMPLATE_DIRS) {
    const templateDir = join(TEMPLATES_DIR, templateName);

    describe(templateName, () => {
      it('has template.yml that parses against TemplateSchema', () => {
        const ymlPath = join(templateDir, 'template.yml');
        expect(existsSync(ymlPath)).toBe(true);

        const raw = yaml.load(readFileSync(ymlPath, 'utf-8'));
        const result = TemplateSchema.safeParse(raw);
        if (!result.success) {
          throw new Error(`template.yml validation failed: ${result.error.message}`);
        }
        expect(result.data.name).toBe(templateName);
      });

      it('has editable.yml that parses against EditableSchema', () => {
        const ymlPath = join(templateDir, 'editable.yml');
        expect(existsSync(ymlPath)).toBe(true);

        const raw = yaml.load(readFileSync(ymlPath, 'utf-8'));
        const result = EditableSchema.safeParse(raw);
        if (!result.success) {
          throw new Error(`editable.yml validation failed: ${result.error.message}`);
        }
      });

      it('editable.yml deny list includes required patterns', () => {
        const ymlPath = join(templateDir, 'editable.yml');
        const raw = yaml.load(readFileSync(ymlPath, 'utf-8'));
        const editable = EditableSchema.parse(raw);

        const requiredDeny = ['**/*.ts', '**/*.astro', 'package.json', 'Dockerfile', '.env*', 'node_modules/**'];
        for (const pattern of requiredDeny) {
          expect(editable.deny, `deny list should include "${pattern}"`).toContain(pattern);
        }
      });

      it('editable.yml allow list does not include API routes', () => {
        const ymlPath = join(templateDir, 'editable.yml');
        const raw = yaml.load(readFileSync(ymlPath, 'utf-8'));
        const editable = EditableSchema.parse(raw);

        for (const pattern of editable.allow) {
          expect(pattern).not.toContain('src/pages/api');
        }
      });

      it('has SKILL.md with valid frontmatter', () => {
        const skillPath = join(templateDir, 'SKILL.md');
        expect(existsSync(skillPath)).toBe(true);

        const content = readFileSync(skillPath, 'utf-8');
        const fmResult = validateSkillFrontmatter(content);
        expect(fmResult.valid, fmResult.error).toBe(true);
      });

      it('SKILL.md has all required sections', () => {
        const skillPath = join(templateDir, 'SKILL.md');
        const content = readFileSync(skillPath, 'utf-8');
        const result = validateSkill(content);
        if (!result.valid) {
          throw new Error(`SKILL.md missing sections: ${result.missing.join(', ')}`);
        }
        expect(result.valid).toBe(true);
      });

      it('declared paths exist in the template', () => {
        const ymlPath = join(templateDir, 'template.yml');
        const raw = yaml.load(readFileSync(ymlPath, 'utf-8'));
        const tmpl = TemplateSchema.parse(raw);

        expect(existsSync(join(templateDir, tmpl.cms_locale_path))).toBe(true);
        expect(existsSync(join(templateDir, tmpl.products_path))).toBe(true);
        expect(existsSync(join(templateDir, tmpl.public_path))).toBe(true);
      });
    });
  }
});
