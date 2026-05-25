import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface SkillFrontmatter {
  name: string;
  description: string;
  version: string;
  applies_to: string[];
}

const REQUIRED_SECTIONS = [
  "## Overview",
  "## Editable Files",
  "## Constraints",
];

export async function loadSkill(templatePath: string): Promise<string> {
  const skillPath = join(templatePath, "SKILL.md");

  let content: string;
  try {
    content = await readFile(skillPath, "utf-8");
  } catch {
    throw new Error(`SKILL.md not found at ${skillPath}`);
  }

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error("SKILL.md is missing frontmatter (--- delimited YAML block)");
  }

  const frontmatterText = frontmatterMatch[1];
  const frontmatter: Partial<SkillFrontmatter> = {};

  for (const line of frontmatterText.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === "name") frontmatter.name = value;
    if (key === "description") frontmatter.description = value;
    if (key === "version") frontmatter.version = value;
    if (key === "applies_to") {
      frontmatter.applies_to = value
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map((s) => s.trim());
    }
  }

  const missing: string[] = [];
  if (!frontmatter.name) missing.push("name");
  if (!frontmatter.description) missing.push("description");
  if (!frontmatter.version) missing.push("version");
  if (!frontmatter.applies_to || frontmatter.applies_to.length === 0) missing.push("applies_to");

  if (missing.length > 0) {
    throw new Error(`SKILL.md frontmatter is missing required fields: ${missing.join(", ")}`);
  }

  // Validate required sections
  const missingSections: string[] = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!content.includes(section)) {
      missingSections.push(section);
    }
  }

  if (missingSections.length > 0) {
    throw new Error(`SKILL.md is missing required sections: ${missingSections.join(", ")}`);
  }

  return content;
}
