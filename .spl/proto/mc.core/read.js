/**
 * mc.core/read — content as opaque bytes. Files only.
 */

import { readFile } from 'node:fs/promises';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');

  return async function (path) {
    const location = await xpathResolve(path);
    if (location.type !== 'file') {
      throw new Error(`mc.core.read: not a file: ${path}`);
    }
    return readFile(location.address);
  };
}
