import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ToolDefinition, ToolHandler } from "../types.js";

export const getCmsLocaleDefinition: ToolDefinition = {
  name: "get_cms_locale",
  description:
    "Read the cms-locale.json file. If a section is specified, returns that section's full content. Otherwise returns all top-level keys with their labelSection values (summary view).",
  input_schema: {
    type: "object",
    properties: {
      section: {
        type: "string",
        description:
          "Optional: a specific top-level section key to return in full. If omitted, returns a summary of all sections.",
      },
    },
  },
};

export function createGetCmsLocaleHandler(templatePath: string): ToolHandler {
  return async (input: Record<string, unknown>): Promise<string> => {
    const section = input.section as string | undefined;

    const cmsPath = join(templatePath, "src", "locale", "cms-locale.json");

    let content: string;
    try {
      content = await readFile(cmsPath, "utf-8");
    } catch {
      throw new Error("cms-locale.json not found in template");
    }

    const data = JSON.parse(content) as Record<string, unknown>;

    if (section) {
      if (!(section in data)) {
        throw new Error(`Section "${section}" not found in cms-locale.json. Available: ${Object.keys(data).join(", ")}`);
      }
      return JSON.stringify(data[section], null, 2);
    }

    // Summary: return top-level keys with their labelSection
    const summary: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "object" && value !== null && "labelSection" in value) {
        summary[key] = (value as Record<string, unknown>).labelSection as string;
      } else {
        summary[key] = typeof value;
      }
    }

    return JSON.stringify(summary, null, 2);
  };
}
