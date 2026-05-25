import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { scanModules } from './scanner.js';
import { resolveDependencies } from './resolver.js';
import { generateCompose } from './compose-generator.js';

const command = process.argv[2];

if (command === 'generate') {
  const baseDir = resolve(process.argv[3] ?? '.');
  console.log(`Scanning ${baseDir} for modules and templates...`);

  const scan = scanModules(baseDir);

  if (scan.errors.length > 0) {
    console.error('Scan errors:');
    for (const err of scan.errors) {
      console.error(`  ${err.path}: ${err.error}`);
    }
    process.exit(1);
  }

  console.log(`Found ${scan.modules.length} modules, ${scan.templates.length} templates`);

  const { ordered, errors } = resolveDependencies(scan.modules.map(m => m.manifest));
  if (errors.length > 0) {
    console.error('Dependency resolution errors:');
    for (const err of errors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log('Dependency order:', ordered.map(m => m.name).join(' → '));

  const providerMap = new Map<string, string>();
  for (const mod of ordered) {
    for (const cap of mod.provides) {
      providerMap.set(cap, mod.name);
    }
  }

  const composeYaml = generateCompose(ordered, scan.templates, providerMap);

  const outDir = join(baseDir, 'deploy', 'compose');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'docker-compose.yml');
  writeFileSync(outPath, composeYaml, 'utf-8');
  console.log(`Generated ${outPath}`);
} else {
  console.log('Usage: aikit-runtime generate [base-dir]');
  console.log('  generate  Scan modules and generate docker-compose.yml');
  process.exit(1);
}
