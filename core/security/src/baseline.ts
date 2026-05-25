import type { ModuleManifest, EditableConfig } from '@aikit/contracts';

export interface SecurityCheck {
  severity: 'error' | 'warning';
  message: string;
  module?: string;
}

const SECRET_PATTERNS = /KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL/i;

export function enforceBaseline(manifest: ModuleManifest): SecurityCheck[] {
  const checks: SecurityCheck[] = [];

  for (const [name, config] of Object.entries(manifest.env)) {
    if (SECRET_PATTERNS.test(name) && !config.secret) {
      checks.push({
        severity: 'error',
        message: `Env var "${name}" looks like a secret but is not marked as secret: true`,
        module: manifest.name,
      });
    }
  }

  if (!manifest.healthcheck && manifest.port) {
    checks.push({
      severity: 'warning',
      message: `Module "${manifest.name}" has a port but no healthcheck declared`,
      module: manifest.name,
    });
  }

  if (manifest.port) {
    const isGateway = manifest.category === 'gateway';
    if (isGateway && ![80, 443].includes(manifest.port)) {
      checks.push({
        severity: 'warning',
        message: `Gateway module "${manifest.name}" uses non-standard port ${manifest.port}`,
        module: manifest.name,
      });
    }
    if (!isGateway && manifest.port < 3000) {
      checks.push({
        severity: 'warning',
        message: `Module "${manifest.name}" uses privileged port ${manifest.port}`,
        module: manifest.name,
      });
    }
  }

  return checks;
}

const REQUIRED_DENY_PATTERNS = [
  '**/*.ts', '**/*.astro', 'astro.config.mjs',
  'Dockerfile', 'package.json', '.env*', 'node_modules/**',
];

export function checkEditablePaths(editable: EditableConfig): SecurityCheck[] {
  const checks: SecurityCheck[] = [];

  for (const pattern of REQUIRED_DENY_PATTERNS) {
    if (!editable.deny.includes(pattern)) {
      checks.push({
        severity: 'warning',
        message: `editable.yml deny list should include "${pattern}"`,
      });
    }
  }

  for (const allowed of editable.allow) {
    if (allowed.includes('src/pages/api/')) {
      checks.push({
        severity: 'error',
        message: `editable.yml must not allow API routes: "${allowed}"`,
      });
    }
  }

  return checks;
}
