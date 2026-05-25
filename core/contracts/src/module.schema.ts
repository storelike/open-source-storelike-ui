import { z } from 'zod';

const EnvVarSchema = z.object({
  required: z.boolean().default(false),
  description: z.string(),
  secret: z.boolean().default(false),
});

const HealthcheckSchema = z.object({
  path: z.string(),
  port: z.number(),
});

const ComposeSchema = z.object({
  image: z.string().optional(),
  build: z.string().optional(),
  volumes: z.array(z.string()).optional(),
  networks: z.array(z.string()).default(['aikit']),
}).optional();

export const ModuleSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Module name must be kebab-case'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver (x.y.z)'),
  description: z.string(),
  category: z.enum([
    'agent', 'gateway', 'store', 'transport', 'auth',
    'observability', 'broker', 'backup', 'llm', 'voice',
  ]).optional(),
  provides: z.array(z.string()),
  requires: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  port: z.number().optional(),
  healthcheck: HealthcheckSchema.optional(),
  env: z.record(z.string(), EnvVarSchema).default({}),
  egress: z.array(z.string()).default([]),
  compose: ComposeSchema,
  author: z.string().optional(),
  repository: z.string().optional(),
  support: z.string().optional(),
});

export type ModuleManifest = z.infer<typeof ModuleSchema>;
export type EnvVarConfig = z.infer<typeof EnvVarSchema>;
