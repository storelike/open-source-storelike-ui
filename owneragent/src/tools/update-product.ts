import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { ToolDefinition, ToolHandler, ProductFrontmatter } from "../types.js";

const updatesSchema = z.object({
  title: z.string().min(1).optional(),
  snippet: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_delivery: z.boolean().optional(),
});

export const updateProductDefinition: ToolDefinition = {
  name: "update_product",
  description:
    "Update an existing product's frontmatter. Reads the existing .md file, merges the updates, validates, and writes back.",
  input_schema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "The slug of the product to update (filename without extension)",
      },
      updates: {
        type: "object",
        description: "Partial product frontmatter fields to update",
        properties: {
          title: { type: "string" },
          snippet: { type: "string" },
          price: { type: "number" },
          discount: { type: "number" },
          category: { type: "string" },
          tags: { type: "array" },
          is_active: { type: "boolean" },
          is_delivery: { type: "boolean" },
        },
      },
    },
    required: ["slug", "updates"],
  },
};

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Could not parse frontmatter");
  }

  const frontmatterText = match[1];
  const body = match[2];

  const frontmatter: Record<string, unknown> = {};
  let currentKey = "";

  for (const line of frontmatterText.split("\n")) {
    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, "");
      if (currentKey && Array.isArray(frontmatter[currentKey])) {
        (frontmatter[currentKey] as string[]).push(value);
      }
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const rawValue = line.slice(colonIndex + 1).trim();

    currentKey = key;

    if (rawValue === "") {
      // Next lines are array items
      frontmatter[key] = [];
    } else if (rawValue === "true") {
      frontmatter[key] = true;
    } else if (rawValue === "false") {
      frontmatter[key] = false;
    } else if (!isNaN(Number(rawValue)) && rawValue !== "") {
      frontmatter[key] = Number(rawValue);
    } else {
      frontmatter[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }

  return { frontmatter, body };
}

function serializeFrontmatter(data: Record<string, unknown>, body: string): string {
  const lines: string[] = ["---"];

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - "${item}"`);
      }
    } else if (typeof value === "string") {
      lines.push(`${key}: "${value}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---");
  return lines.join("\n") + "\n" + body;
}

export function createUpdateProductHandler(templatePath: string): ToolHandler {
  return async (input: Record<string, unknown>): Promise<string> => {
    const slug = input.slug as string;
    const updates = input.updates as Record<string, unknown>;

    if (!slug || !updates) {
      throw new Error("slug and updates are required");
    }

    const validatedUpdates = updatesSchema.parse(updates);

    const productsDir = join(templatePath, "src", "content", "products");
    const filePath = join(productsDir, `${slug}.md`);

    let content: string;
    try {
      content = await readFile(filePath, "utf-8");
    } catch {
      throw new Error(`Product "${slug}" not found`);
    }

    const { frontmatter, body } = parseFrontmatter(content);

    // Merge updates
    for (const [key, value] of Object.entries(validatedUpdates)) {
      if (value !== undefined) {
        frontmatter[key] = value;
      }
    }

    const newContent = serializeFrontmatter(frontmatter, body);
    await writeFile(filePath, newContent, "utf-8");

    return JSON.stringify({
      success: true,
      slug,
      updated_fields: Object.keys(validatedUpdates).filter(
        (k) => validatedUpdates[k as keyof typeof validatedUpdates] !== undefined
      ),
    });
  };
}
