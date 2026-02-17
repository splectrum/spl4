/**
 * mc.core/list — directory children with depth-controlled flattening.
 *
 * Gets layer info from mc.xpath (dirs, hidden, refs), then does
 * the physical merge: readdir each layer, apply hidden, shadow
 * by priority, add reference-only entries.
 *
 * mc.xpath reports WHERE (layer structure).
 * mc.core does WHAT (physical reading and merging).
 *
 * Non-context directories (no .spl/) flatten through up to depth.
 * depth 0 = immediate children (default). depth -1 = infinite.
 */

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');

  async function safeStat(path) {
    try { return await stat(path); }
    catch { return null; }
  }

  async function buildChild(name, address, contextPath, source, ref) {
    const s = await safeStat(address);
    if (!s) return null;

    const childPath = contextPath === '/'
      ? '/' + name
      : contextPath + '/' + name;

    const child = {
      path: childPath,
      address,
      state: 'real',
      source,
      type: s.isFile() ? 'file' : 'directory',
      isContext: s.isFile() || !!(await safeStat(join(address, '.spl')))?.isDirectory(),
    };
    if (ref) child.ref = ref;
    return child;
  }

  /**
   * Merge entries from layer info and recurse for depth.
   */
  async function mergeAndRecurse(layers, depth) {
    const { dirs, hidden, refs } = layers;
    const contextPath = dirs[0].path;
    const seen = new Set();
    const merged = [];

    // 1. Entries from each directory layer (priority order)
    for (const dir of dirs) {
      let names;
      try { names = await readdir(dir.address); }
      catch { continue; }

      const isLocal = dir.source === 'local';

      for (const name of names) {
        if (seen.has(name)) continue;
        if (isLocal && hidden.has(name)) continue;

        const child = await buildChild(
          name, join(dir.address, name), contextPath, dir.source, dir.ref
        );
        if (child) {
          merged.push(child);
          seen.add(name);
        }
      }
    }

    // 2. Reference-only entries from refs.json
    for (const [name, refLayers] of Object.entries(refs)) {
      if (seen.has(name)) continue;

      for (let i = 0; i < refLayers.length; i++) {
        const target = refLayers[i].target;
        const ref = { context: contextPath, name, target, layer: i };
        const child = await buildChild(name, target, contextPath, 'reference', ref);
        if (child) {
          merged.push(child);
          seen.add(name);
          break;
        }
      }
    }

    // 3. Depth recursion — non-context directories flatten
    if (depth === 0) return merged;

    const result = [];
    for (const child of merged) {
      if (child.type === 'directory' && !child.isContext) {
        const nextDepth = depth === -1 ? -1 : depth - 1;
        result.push(...await listDirect(child, nextDepth));
      } else {
        result.push(child);
      }
    }
    return result;
  }

  /**
   * Direct listing by address — for depth recursion into
   * subdirectories where we already have the physical address.
   */
  async function listDirect(location, depth) {
    let names;
    try { names = await readdir(location.address); }
    catch { return []; }

    const results = [];
    for (const name of names) {
      const child = await buildChild(
        name, join(location.address, name), location.path, location.source, location.ref
      );
      if (!child) continue;

      if (child.type === 'directory' && !child.isContext && depth !== 0) {
        const nextDepth = depth === -1 ? -1 : depth - 1;
        results.push(...await listDirect(child, nextDepth));
      } else {
        results.push(child);
      }
    }
    return results;
  }

  return async function (path, options) {
    const location = await xpathResolve(path);
    if (location.type !== 'directory') {
      throw new Error(`mc.core.list: not a directory: ${path}`);
    }
    const depth = options?.depth ?? 0;
    const layers = await xpathResolve.layers(path);
    if (!layers) {
      throw new Error(`mc.core.list: cannot list: ${path}`);
    }
    return mergeAndRecurse(layers, depth);
  };
}
