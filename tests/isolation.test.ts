import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { ModuleSchema, type ModuleManifest } from '../core/contracts/src/module.schema.js';
import { resolveDependencies } from '../core/runtime/src/resolver.js';

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
];

function loadModule(name: string): ModuleManifest {
  const ymlPath = join(ROOT, name, 'module.yml');
  const raw = yaml.load(readFileSync(ymlPath, 'utf-8'));
  return ModuleSchema.parse(raw);
}

describe('Module isolation', () => {
  it('publicagent does not provide write capabilities', () => {
    const manifest = loadModule('publicagent');
    expect(manifest.provides).not.toContain('write');
    expect(manifest.provides).not.toContain('owneragent');
    expect(manifest.provides).not.toContain('template-edit');
  });

  it('publicagent does not require auth', () => {
    const manifest = loadModule('publicagent');
    expect(manifest.requires).not.toContain('auth');
  });

  it('owneragent requires auth', () => {
    const manifest = loadModule('owneragent');
    expect(manifest.requires).toContain('auth');
  });

  it('all mandatory modules resolve without circular dependencies', () => {
    const modules = MODULE_DIRS
      .filter(name => existsSync(join(ROOT, name, 'module.yml')))
      .map(name => loadModule(name));

    const result = resolveDependencies(modules);
    expect(result.errors).toHaveLength(0);
    expect(result.ordered.length).toBe(modules.length);
  });

  it('all modules declare a healthcheck or have no port', () => {
    for (const name of MODULE_DIRS) {
      const moduleDir = join(ROOT, name);
      if (!existsSync(join(moduleDir, 'module.yml'))) continue;

      const manifest = loadModule(name);
      if (manifest.port) {
        expect(manifest.healthcheck, `${name} has port ${manifest.port} but no healthcheck`).toBeDefined();
      }
    }
  });

  it('no module requires a template directly', () => {
    for (const name of MODULE_DIRS) {
      const moduleDir = join(ROOT, name);
      if (!existsSync(join(moduleDir, 'module.yml'))) continue;

      const manifest = loadModule(name);
      for (const req of manifest.requires) {
        expect(req).not.toContain('template');
        expect(req).not.toContain('basic');
        expect(req).not.toContain('web-folio');
      }
    }
  });

  it('no two modules provide the same capability', () => {
    const capabilities = new Map<string, string>();
    for (const name of MODULE_DIRS) {
      if (!existsSync(join(ROOT, name, 'module.yml'))) continue;
      const manifest = loadModule(name);
      for (const cap of manifest.provides) {
        if (capabilities.has(cap)) {
          throw new Error(`Both "${capabilities.get(cap)}" and "${name}" provide "${cap}"`);
        }
        capabilities.set(cap, name);
      }
    }
  });
});
