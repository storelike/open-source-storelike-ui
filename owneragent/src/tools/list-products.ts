import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ToolDefinition, ToolHandler } from "../types.js";

export const listProductsDefinition: ToolDefinition = {
  name: "list_products",
  description:
    "List all product markdown files in the template's content/products directory. Returns an array of { slug, title } objects.",
  input_schema: {
    type: "object",
    properties: {},
  },
};

export function createListProductsHandler(templatePath: string): ToolHandler {
  return async (): Promise<string> => {
    const productsDir = join(templatePath, "src", "content", "products");

    let files: string[];
    try {
      files = await readdir(productsDir);
    } catch {
      return JSON.stringify([]);
    }

    const mdFiles = files.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

    const products: Array<{ slug: string; title: string }> = [];

    for (const file of mdFiles) {
      const slug = file.replace(/\.mdx?$/, "");
      const content = await readFile(join(productsDir, file), "utf-8");

      // Extract title from frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let title = slug;

      if (frontmatterMatch) {
        const titleMatch = frontmatterMatch[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
        if (titleMatch) {
          title = titleMatch[1];
        }
      }

      products.push({ slug, title });
    }

    return JSON.stringify(products);
  };
}
