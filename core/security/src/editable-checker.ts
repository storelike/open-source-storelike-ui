import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import micromatch from 'micromatch';
import { EditableSchema, type EditableConfig } from '@aikit/contracts';

export function loadEditable(templatePath: string): EditableConfig {
  const raw = readFileSync(join(templatePath, 'editable.yml'), 'utf-8');
  return EditableSchema.parse(yaml.load(raw));
}

export function isAllowed(editable: EditableConfig, filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');

  if (micromatch.isMatch(normalizedPath, editable.deny)) {
    return false;
  }

  if (micromatch.isMatch(normalizedPath, editable.allow)) {
    return true;
  }

  return false;
}
