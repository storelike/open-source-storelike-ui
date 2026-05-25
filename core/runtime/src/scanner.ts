import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { ModuleSchema, TemplateSchema, type ModuleManifest, type TemplateManifest } from '@aikit/contracts';

export interface ScanResult {
  modules: Array<{ path: string; manifest: ModuleManifest }>;
  templates: Array<{ path: string; manifest: TemplateManifest }>;
  errors: Array<{ path: string; error: string }>;
}

export function scanModules(baseDir: string): ScanResult {
  const result: ScanResult = { modules: [], templates: [], errors: [] };

  const entries = readdirSync(baseDir);
  for (const entry of entries) {
    const fullPath = join(baseDir, entry);
    if (!statSync(fullPath).isDirectory()) continue;

    const moduleYml = join(fullPath, 'module.yml');
    if (existsSync(moduleYml)) {
      try {
        const raw = yaml.load(readFileSync(moduleYml, 'utf-8'));
        const manifest = ModuleSchema.parse(raw);
        result.modules.push({ path: fullPath, manifest });
      } catch (err) {
        result.errors.push({ path: moduleYml, error: String(err) });
      }
    }
  }

  const templatesDir = join(baseDir, 'ecommerce-templates');
  if (existsSync(templatesDir)) {
    const templateEntries = readdirSync(templatesDir);
    for (const entry of templateEntries) {
      const fullPath = join(templatesDir, entry);
      if (!statSync(fullPath).isDirectory()) continue;

      const templateYml = join(fullPath, 'template.yml');
      if (existsSync(templateYml)) {
        try {
          const raw = yaml.load(readFileSync(templateYml, 'utf-8'));
          const manifest = TemplateSchema.parse(raw);
          result.templates.push({ path: fullPath, manifest });
        } catch (err) {
          result.errors.push({ path: templateYml, error: String(err) });
        }
      }
    }
  }

  return result;
}
