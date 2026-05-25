const SECRET_PATTERNS = [
  /(?:api[_-]?key|token|secret|password)\s*[:=]\s*["'][^"']{8,}/gi,
  /sk-[a-zA-Z0-9]{20,}/g,
  /ghp_[a-zA-Z0-9]{36}/g,
  /xoxb-[0-9]+-[a-zA-Z0-9]+/g,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
];

export interface SecretFinding {
  line: number;
  pattern: string;
  snippet: string;
}

export function scanForHardcodedSecrets(content: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of SECRET_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(line);
      if (match) {
        findings.push({
          line: i + 1,
          pattern: pattern.source.slice(0, 40),
          snippet: match[0].slice(0, 20) + '...',
        });
      }
    }
  }

  return findings;
}
