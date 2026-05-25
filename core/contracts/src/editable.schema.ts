import { z } from 'zod';

export const EditableSchema = z.object({
  allow: z.array(z.string()),
  deny: z.array(z.string()),
  max_file_size_kb: z.number().default(512),
  require_backup: z.boolean().default(true),
});

export type EditableConfig = z.infer<typeof EditableSchema>;
