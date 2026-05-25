const MAX_LENGTH = 2000;

const CODE_BLOCK_REGEX = /```[\s\S]*?```/g;

const SENSITIVE_PATTERNS = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*\S+/gi,
  /(?:token|bearer)\s*[:=]\s*\S+/gi,
  /(?:password|passwd|pwd)\s*[:=]\s*\S+/gi,
  /(?:secret|private[_-]?key)\s*[:=]\s*\S+/gi,
  /sk-[a-zA-Z0-9]{20,}/g,
  /ghp_[a-zA-Z0-9]{36,}/g,
  /(?:AKIA|ASIA)[A-Z0-9]{16}/g,
  /eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g,
];

export function filterOutput(text: string): string {
  let filtered = text;

  filtered = filtered.replace(CODE_BLOCK_REGEX, "[code removed]");

  for (const pattern of SENSITIVE_PATTERNS) {
    filtered = filtered.replace(pattern, "[REDACTED]");
  }

  if (filtered.length > MAX_LENGTH) {
    filtered = filtered.slice(0, MAX_LENGTH);
  }

  return filtered;
}
