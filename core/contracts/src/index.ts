import { z } from 'zod';
import yaml from 'js-yaml';

export { ModuleSchema, type ModuleManifest, type EnvVarConfig } from './module.schema.js';
export { TemplateSchema, type TemplateManifest } from './template.schema.js';
export { EditableSchema, type EditableConfig } from './editable.schema.js';
export {
  validateSkill,
  validateSkillFrontmatter,
  hasSection,
  type SkillValidationResult,
  type SkillSection,
} from './skill.schema.js';

export function parseYaml<T>(schema: z.ZodType<T>, yamlString: string): T {
  const raw = yaml.load(yamlString);
  return schema.parse(raw);
}
