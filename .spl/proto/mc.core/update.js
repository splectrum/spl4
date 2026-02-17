/**
 * mc.core/update — change existing file content.
 *
 * Copy-on-write: if the file resolves through a reference,
 * creates a local copy with the new content. The local copy
 * shadows the reference on future reads.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve as pathResolve } from 'node:path';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');
  const absRoot = pathResolve(execDoc.root);

  return async function (path, content) {
    const location = await xpathResolve(path);
    if (location.type !== 'file') {
      throw new Error(`mc.core.update: not a file: ${path}`);
    }

    if (location.source === 'reference') {
      // Copy-on-write: create locally
      const localAddress = location.path === '/'
        ? absRoot
        : join(absRoot, location.path.slice(1));
      await mkdir(dirname(localAddress), { recursive: true });
      await writeFile(localAddress, content);
    } else {
      await writeFile(location.address, content);
    }
  };
}
