import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { EditableSchema, type EditableConfig } from '../core/contracts/src/editable.schema.js';
import { isAllowed } from '../core/security/src/editable-checker.js';

const ROOT = join(import.meta.dirname, '..');

function loadEditable(templateName: string): EditableConfig {
  const ymlPath = join(ROOT, 'ecommerce-templates', templateName, 'editable.yml');
  const raw = yaml.load(readFileSync(ymlPath, 'utf-8'));
  return EditableSchema.parse(raw);
}

describe('AI-edit scope enforcement', () => {
  describe('basic template', () => {
    const editable = loadEditable('basic');

    it('allows cms-locale.json', () => {
      expect(isAllowed(editable, 'src/locale/cms-locale.json')).toBe(true);
    });

    it('allows product markdown files', () => {
      expect(isAllowed(editable, 'src/content/products/my-product.md')).toBe(true);
    });

    it('allows fragment HTML files', () => {
      expect(isAllowed(editable, 'public/fragmentAbout.html')).toBe(true);
    });

    it('allows product images', () => {
      expect(isAllowed(editable, 'public/images-product/test/test.webp')).toBe(true);
    });

    it('denies TypeScript files', () => {
      expect(isAllowed(editable, 'src/pages/api/feedback.ts')).toBe(false);
    });

    it('denies Astro files', () => {
      expect(isAllowed(editable, 'src/pages/index.astro')).toBe(false);
    });

    it('denies astro.config.mjs', () => {
      expect(isAllowed(editable, 'astro.config.mjs')).toBe(false);
    });

    it('denies package.json', () => {
      expect(isAllowed(editable, 'package.json')).toBe(false);
    });

    it('denies Dockerfile', () => {
      expect(isAllowed(editable, 'Dockerfile')).toBe(false);
    });

    it('denies .env files', () => {
      expect(isAllowed(editable, '.env')).toBe(false);
      expect(isAllowed(editable, '.env.production')).toBe(false);
    });

    it('denies node_modules', () => {
      expect(isAllowed(editable, 'node_modules/fastify/index.js')).toBe(false);
    });

    it('denies layout files', () => {
      expect(isAllowed(editable, 'src/layouts/Layout.astro')).toBe(false);
    });

    it('denies component files', () => {
      expect(isAllowed(editable, 'src/components/Hero.astro')).toBe(false);
    });

    it('denies files not in any list (default deny)', () => {
      expect(isAllowed(editable, 'random-file.txt')).toBe(false);
    });
  });

  describe('deny overrides allow', () => {
    it('deny wins when path matches both allow and deny', () => {
      const editable: EditableConfig = {
        allow: ['src/**'],
        deny: ['src/secret.ts'],
        max_file_size_kb: 512,
        require_backup: true,
      };
      expect(isAllowed(editable, 'src/secret.ts')).toBe(false);
    });

    it('broad deny overrides specific allow', () => {
      const editable: EditableConfig = {
        allow: ['src/locale/cms-locale.json'],
        deny: ['**/*.json'],
        max_file_size_kb: 512,
        require_backup: true,
      };
      expect(isAllowed(editable, 'src/locale/cms-locale.json')).toBe(false);
    });
  });

  describe('path traversal prevention', () => {
    const editable = loadEditable('basic');

    it('denies paths with ../', () => {
      expect(isAllowed(editable, '../.env')).toBe(false);
    });

    it('denies paths attempting to escape template dir', () => {
      expect(isAllowed(editable, 'src/../../etc/passwd')).toBe(false);
    });
  });
});
