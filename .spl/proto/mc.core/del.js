/**
 * mc.core/del — remove an entry. Recursive for directories.
 */

import { rm } from 'node:fs/promises';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');

  return async function (path) {
    const location = await xpathResolve(path);
    if (location.state !== 'real') {
      throw new Error(`mc.core.del: not real: ${path}`);
    }
    await rm(location.address, { recursive: true, force: true });
  };
}
