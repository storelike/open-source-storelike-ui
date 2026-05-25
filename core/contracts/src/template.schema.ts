import { z } from 'zod';

export const TemplateSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Template name must be kebab-case'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver (x.y.z)'),
  description: z.string(),
  requires: z.array(z.string()).default([]),
  optional: z.array(z.string()).default([]),
  cms_locale_path: z.string(),
  products_path: z.string(),
  public_path: z.string(),
  port: z.number().default(8080),
});

export type TemplateManifest = z.infer<typeof TemplateSchema>;
