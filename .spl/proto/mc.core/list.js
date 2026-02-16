/**
 * mc.core/list — directory children with depth-controlled flattening.
 *
 * Non-context directories (no .spl/) flatten through up to depth.
 * depth 0 = immediate children (default). depth -1 = infinite.
 */

import { readdir } from 'node:fs/promises';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');

  async function listAtDepth(location, depth) {
    const entries = await readdir(location.address, { withFileTypes: true });
    const result = [];

    for (const e of entries) {
      const childPath = location.path === '/'
        ? '/' + e.name
        : location.path + '/' + e.name;
      const child = await xpathResolve(childPath);

      if (child.type === 'directory' && !child.isContext && depth !== 0) {
        const nextDepth = depth === -1 ? -1 : depth - 1;
        result.push(...await listAtDepth(child, nextDepth));
      } else {
        result.push(child);
      }
    }

    return result;
  }

  return async function (path, options) {
    const location = await xpathResolve(path);
    if (location.type !== 'directory') {
      throw new Error(`mc.core.list: not a directory: ${path}`);
    }
    const depth = options?.depth ?? 0;
    return listAtDepth(location, depth);
  };
}
