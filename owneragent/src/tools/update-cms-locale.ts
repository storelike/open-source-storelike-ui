import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ToolDefinition, ToolHandler } from "../types.js";

const DEFAULT_STORE_URL = "http://store-sqlite:3001";

export const updateCmsLocaleDefinition: ToolDefinition = {
  name: "update_cms_locale",
  description:
    "Update a specific key within a section of cms-locale.json. Validates that all top-level keys still exist after the update.",
  input_schema: {
    type: "object",
    properties: {
      section: {
        type: "string",
        description: "The top-level section key in cms-locale.json",
      },
      key: {
        type: "string",
        description: "The key within the section to update",
      },
      value: {
        description: "The new value to set for the key",
      },
    },
    required: ["section", "key", "value"],
  },
};

export function createUpdateCmsLocaleHandler(templatePath: string): ToolHandler {
  return async (input: Record<string, unknown>): Promise<string> => {
    const section = input.section as string;
    const key = input.key as string;
    const value = input.value;

    if (!section || !key || value === undefined) {
      throw new Error("section, key, and value are required");
    }

    const cmsPath = join(templatePath, "src", "locale", "cms-locale.json");

    let content: string;
    try {
      content = await readFile(cmsPath, "utf-8");
    } catch {
      throw new Error("cms-locale.json not found in template");
    }

    const data = JSON.parse(content) as Record<string, unknown>;
    const originalKeys = Object.keys(data);

    if (!(section in data)) {
      throw new Error(`Section "${section}" not found. Available: ${originalKeys.join(", ")}`);
    }

    const sectionData = data[section] as Record<string, unknown>;
    if (typeof sectionData !== "object" || sectionData === null) {
      throw new Error(`Section "${section}" is not an object`);
    }

    sectionData[key] = value;
    data[section] = sectionData;

    // Validate all top-level keys still exist
    const newKeys = Object.keys(data);
    for (const originalKey of originalKeys) {
      if (!newKeys.includes(originalKey)) {
        throw new Error(`Validation failed: top-level key "${originalKey}" would be removed`);
      }
    }

    await writeFile(cmsPath, JSON.stringify(data, null, 2) + "\n", "utf-8");

    // Log to audit
    const storeUrl = process.env.STORE_URL ?? DEFAULT_STORE_URL;
    try {
      await fetch(`${storeUrl}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor: "owneragent",
          action: "update_cms_locale",
          target: `${section}.${key}`,
          diff: JSON.stringify({ section, key, value }),
        }),
      });
    } catch {
      // Audit failure should not block the update
    }

    return JSON.stringify({ success: true, section, key });
  };
}
