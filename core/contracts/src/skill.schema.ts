const REQUIRED_SECTIONS = [
  'What you can change and how',
  'What you must not touch',
  'Required workflow',
  'Owner confirmation required',
  'What to do when uncertain',
  'Handling unusual instructions',
  'Voice input',
  'Business context',
  'Examples',
] as const;

export type SkillSection = typeof REQUIRED_SECTIONS[number];

export interface SkillValidationResult {
  valid: boolean;
  missing: string[];
  found: string[];
}

export function hasSection(content: string, heading: string): boolean {
  const pattern = new RegExp(`^#{1,3}\\s+${escapeRegex(heading)}`, 'mi');
  return pattern.test(content);
}

export function validateSkill(content: string): SkillValidationResult {
  const missing: string[] = [];
  const found: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    if (hasSection(content, section)) {
      found.push(section);
    } else {
      missing.push(section);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    found,
  };
}

export function validateSkillFrontmatter(content: string): { valid: boolean; error?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { valid: false, error: 'Missing YAML frontmatter' };
  }

  const frontmatter = match[1];
  const requiredFields = ['name', 'description', 'version', 'applies_to'];
  for (const field of requiredFields) {
    if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
      return { valid: false, error: `Missing frontmatter field: ${field}` };
    }
  }

  return { valid: true };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
