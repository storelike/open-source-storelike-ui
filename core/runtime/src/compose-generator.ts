import type { ModuleManifest, TemplateManifest } from '@aikit/contracts';
import yaml from 'js-yaml';

export interface ComposeOptions {
  projectName?: string;
  networkName?: string;
}

interface ComposeService {
  build?: string;
  image?: string;
  ports?: string[];
  environment?: Record<string, string>;
  volumes?: string[];
  networks?: string[];
  depends_on?: Record<string, { condition: string }>;
  healthcheck?: {
    test: string[];
    interval: string;
    timeout: string;
    retries: number;
  };
  restart: string;
}

export function generateCompose(
  modules: ModuleManifest[],
  templates: Array<{ path: string; manifest: TemplateManifest }>,
  providerMap: Map<string, string>,
  options: ComposeOptions = {}
): string {
  const networkName = options.networkName ?? 'aikit';
  const services: Record<string, ComposeService> = {};
  const volumes: Record<string, { driver: string }> = {};

  for (const mod of modules) {
    const service: ComposeService = { restart: 'unless-stopped' };

    if (mod.compose?.build) {
      service.build = mod.compose.build;
    } else if (mod.compose?.image) {
      service.image = mod.compose.image;
    } else {
      service.build = `./${mod.name}`;
    }

    if (mod.port) {
      service.ports = [`${mod.port}:${mod.port}`];
      // A TLS gateway on 443 also needs port 80 published so Caddy can answer
      // the ACME HTTP-01 challenge and serve the HTTP->HTTPS redirect on a VPS.
      if (mod.category === 'gateway' && mod.port === 443) {
        service.ports.unshift('80:80');
      }
    }

    if (Object.keys(mod.env).length > 0) {
      service.environment = {};
      for (const [key, config] of Object.entries(mod.env)) {
        service.environment[key] = `\${${key}}`;
      }
    }

    if (mod.compose?.volumes && mod.compose.volumes.length > 0) {
      service.volumes = mod.compose.volumes;
      for (const vol of mod.compose.volumes) {
        const volName = vol.split(':')[0];
        // Only register top-level named volumes. Bind mounts (absolute/relative
        // paths or env-var sources like ${TEMPLATES_PATH:-.}/...) must be skipped,
        // otherwise the generator emits an invalid volume key that breaks compose.
        if (/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(volName)) {
          volumes[volName] = { driver: 'local' };
        }
      }
    }

    service.networks = mod.compose?.networks ?? [networkName];

    if (mod.healthcheck) {
      service.healthcheck = {
        test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider',
          `http://localhost:${mod.healthcheck.port}${mod.healthcheck.path}`],
        interval: '30s',
        timeout: '10s',
        retries: 3,
      };
    }

    if (mod.requires.length > 0) {
      service.depends_on = {};
      for (const req of mod.requires) {
        const provider = providerMap.get(req);
        if (provider) {
          service.depends_on[provider] = { condition: 'service_started' };
        }
      }
    }

    services[mod.name] = service;
  }

  let templatePort = 8080;
  for (const tmpl of templates) {
    const service: ComposeService = {
      build: `./ecommerce-templates/${tmpl.manifest.name}`,
      ports: [`${templatePort}:${tmpl.manifest.port}`],
      networks: [networkName],
      restart: 'unless-stopped',
    };
    services[tmpl.manifest.name] = service;
    templatePort++;
  }

  const compose = {
    services,
    networks: {
      [networkName]: { driver: 'bridge' },
    },
    ...(Object.keys(volumes).length > 0 ? { volumes } : {}),
  };

  return yaml.dump(compose, { lineWidth: 120, noRefs: true });
}
