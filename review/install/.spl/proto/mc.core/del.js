/**
 * mc.core/del — remove an entry. Recursive for directories.
 *
 * Write isolation: only deletes local resources. If the path
 * resolves to a reference (no local overlay), rejects.
 * Deleting a local overlay re-exposes the reference beneath.
 */

import { rm } from 'node:fs/promises';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');

  return async function (path) {
    const location = await xpathResolve(path);

    if (location.source === 'reference') {
      throw new Error(`mc.core.del: cannot delete reference: ${path}`);
    }

    await rm(location.address, { recursive: true, force: true });
  };
}
