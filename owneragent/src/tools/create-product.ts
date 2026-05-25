import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { z } from "zod";
import type { ToolDefinition, ToolHandler } from "../types.js";

const productSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1),
  snippet: z.string().min(1),
  price: z.number().positive(),
  discount: z.number().min(0).max(100).optional(),
  category: z.string().min(1),
  tags: z.array(z.string()),
  is_active: z.boolean(),
  is_delivery: z.boolean(),
});

export const createProductDefinition: ToolDefinition = {
  name: "create_product",
  description:
    "Create a new product markdown file in the content/products directory. Validates input against the product schema.",
  input_schema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "URL-friendly slug (lowercase alphanumeric with hyphens)",
      },
      title: { type: "string", description: "Product title" },
      snippet: { type: "string", description: "Short product description" },
      price: { type: "number", description: "Product price" },
      discount: { type: "number", description: "Discount percentage (0-100)" },
      category: { type: "string", description: "Product category" },
      tags: {
        type: "array",
        description: "Array of tag strings",
      },
      is_active: { type: "boolean", description: "Whether the product is active" },
      is_delivery: { type: "boolean", description: "Whether delivery is available" },
    },
    required: ["slug", "title", "snippet", "price", "category", "tags", "is_active", "is_delivery"],
  },
};

export function createCreateProductHandler(templatePath: string): ToolHandler {
  return async (input: Record<string, unknown>): Promise<string> => {
    const parsed = productSchema.parse(input);

    const productsDir = join(templatePath, "src", "content", "products");
    const filePath = join(productsDir, `${parsed.slug}.md`);

    await mkdir(productsDir, { recursive: true });

    const tagsYaml = parsed.tags.map((t) => `  - "${t}"`).join("\n");

    const frontmatter = [
      "---",
      `slug: "${parsed.slug}"`,
      `title: "${parsed.title}"`,
      `snippet: "${parsed.snippet}"`,
      `price: ${parsed.price}`,
      ...(parsed.discount !== undefined ? [`discount: ${parsed.discount}`] : []),
      `category: "${parsed.category}"`,
      `tags:`,
      tagsYaml,
      `is_active: ${parsed.is_active}`,
      `is_delivery: ${parsed.is_delivery}`,
      "---",
      "",
      `# ${parsed.title}`,
      "",
      parsed.snippet,
      "",
    ].join("\n");

    await writeFile(filePath, frontmatter, "utf-8");

    const relativePath = `src/content/products/${parsed.slug}.md`;
    return JSON.stringify({ path: relativePath });
  };
}
