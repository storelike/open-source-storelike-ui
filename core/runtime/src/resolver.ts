import type { ModuleManifest } from '@aikit/contracts';

export interface ResolveResult {
  ordered: ModuleManifest[];
  errors: string[];
}

export function resolveDependencies(modules: ModuleManifest[]): ResolveResult {
  const errors: string[] = [];

  const providerMap = new Map<string, string>();
  for (const mod of modules) {
    for (const cap of mod.provides) {
      if (providerMap.has(cap)) {
        errors.push(
          `Conflict: both "${providerMap.get(cap)}" and "${mod.name}" provide "${cap}"`
        );
      }
      providerMap.set(cap, mod.name);
    }
  }

  for (const mod of modules) {
    for (const req of mod.requires) {
      if (!providerMap.has(req)) {
        errors.push(`Unsatisfied dependency: "${mod.name}" requires "${req}" but no module provides it`);
      }
    }
  }

  for (const mod of modules) {
    for (const conflict of mod.conflicts) {
      if (providerMap.has(conflict)) {
        errors.push(
          `Conflict: "${mod.name}" conflicts with capability "${conflict}" provided by "${providerMap.get(conflict)}"`
        );
      }
    }
  }

  if (errors.length > 0) {
    return { ordered: [], errors };
  }

  const nameMap = new Map<string, ModuleManifest>();
  for (const mod of modules) {
    nameMap.set(mod.name, mod);
  }

  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();

  for (const mod of modules) {
    inDegree.set(mod.name, 0);
    graph.set(mod.name, []);
  }

  for (const mod of modules) {
    for (const req of mod.requires) {
      const provider = providerMap.get(req)!;
      graph.get(provider)!.push(mod.name);
      inDegree.set(mod.name, (inDegree.get(mod.name) ?? 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [name, deg] of inDegree) {
    if (deg === 0) queue.push(name);
  }

  const ordered: ModuleManifest[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    ordered.push(nameMap.get(current)!);

    for (const neighbor of graph.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (ordered.length !== modules.length) {
    errors.push('Circular dependency detected among modules');
    return { ordered: [], errors };
  }

  return { ordered, errors: [] };
}
