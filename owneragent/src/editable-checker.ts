import { readFile } from "node:fs/promises";
import { join } from "node:path";
import yaml from "js-yaml";
import micromatch from "micromatch";
import type { EditableConfig } from "./types.js";

export async function loadEditable(templatePath: string): Promise<EditableConfig> {
  const editablePath = join(templatePath, "editable.yml");

  try {
    const content = await readFile(editablePath, "utf-8");
    const parsed = yaml.load(content) as Record<string, unknown>;

    const allow = Array.isArray(parsed.allow) ? (parsed.allow as string[]) : ["**/*"];
    const deny = Array.isArray(parsed.deny) ? (parsed.deny as string[]) : [];

    return { allow, deny };
  } catch {
    // Default: allow common content files, deny everything else sensitive
    return {
      allow: [
        "src/locale/**",
        "src/content/**",
        "public/**",
      ],
      deny: [
        "node_modules/**",
        ".env*",
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "Dockerfile",
        "dist/**",
      ],
    };
  }
}

export function isAllowed(editable: EditableConfig, filePath: string): boolean {
  // Deny always wins
  if (editable.deny.length > 0 && micromatch.isMatch(filePath, editable.deny)) {
    return false;
  }

  // Then check allow
  if (editable.allow.length > 0) {
    return micromatch.isMatch(filePath, editable.allow);
  }

  return false;
}
