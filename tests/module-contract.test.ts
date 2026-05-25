import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { ModuleSchema } from '../core/contracts/src/module.schema.js';

const ROOT = join(import.meta.dirname, '..');

const MODULE_DIRS = [
  'publicagent',
  'owneragent',
  'gateway',
  'store-sqlite',
  'transport-telegram',
  'auth-totp',
  'llm-anthropic',
  'voice',
  'observability-loki',
  'backup-local',
];

describe('Module contract validation', () => {
  for (const moduleName of MODULE_DIRS) {
    const moduleDir = join(ROOT, moduleName);

    describe(moduleName, () => {
      it('has module.yml that parses against ModuleSchema', () => {
        const ymlPath = join(moduleDir, 'module.yml');
        expect(existsSync(ymlPath), `${ymlPath} should exist`).toBe(true);

        const raw = yaml.load(readFileSync(ymlPath, 'utf-8'));
        const result = ModuleSchema.safeParse(raw);
        if (!result.success) {
          throw new Error(`module.yml validation failed: ${result.error.message}`);
        }
        expect(result.data.name).toBe(moduleName);
      });

      it('has a Dockerfile', () => {
        expect(existsSync(join(moduleDir, 'Dockerfile'))).toBe(true);
      });

      it('has a README.md', () => {
        expect(existsSync(join(moduleDir, 'README.md'))).toBe(true);
      });

      it('has src/index.ts or is a non-Node module', () => {
        const hasIndex = existsSync(join(moduleDir, 'src', 'index.ts'));
        const isNonNode = moduleName === 'gateway' || moduleName === 'observability-loki';
        expect(hasIndex || isNonNode).toBe(true);
      });

      it('marks secret env vars correctly', () => {
        const ymlPath = join(moduleDir, 'module.yml');
        const raw = yaml.load(readFileSync(ymlPath, 'utf-8')) as Record<string, unknown>;
        const parsed = ModuleSchema.parse(raw);

        const secretPatterns = /KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL/i;
        for (const [name, config] of Object.entries(parsed.env)) {
          if (secretPatterns.test(name)) {
            expect(config.secret, `Env var "${name}" looks like a secret but secret is not true`).toBe(true);
          }
        }
      });
    });
  }
});
