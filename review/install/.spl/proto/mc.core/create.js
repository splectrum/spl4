/**
 * mc.core/create — make a new entry.
 *
 * File if content provided, directory if not.
 * Operates on parent — the thing being created doesn't exist yet.
 *
 * Copy-on-write: if parent resolves through a reference,
 * creates the local directory structure and writes locally.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve as pathResolve } from 'node:path';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');
  const absRoot = pathResolve(execDoc.root);

  return async function (parentPath, key, content) {
    const parent = await xpathResolve(parentPath);
    if (parent.type !== 'directory') {
      throw new Error(`mc.core.create: parent not a directory: ${parentPath}`);
    }

    // Always write locally — copy-on-write for references
    let targetDir;
    if (parent.source === 'reference') {
      const localParentAddress = parent.path === '/'
        ? absRoot
        : join(absRoot, parent.path.slice(1));
      await mkdir(localParentAddress, { recursive: true });
      targetDir = localParentAddress;
    } else {
      targetDir = parent.address;
    }

    const targetAddress = join(targetDir, key);
    if (content !== undefined) {
      await writeFile(targetAddress, content);
    } else {
      await mkdir(targetAddress, { recursive: true });
    }

    const childPath = parent.path === '/'
      ? '/' + key
      : parent.path + '/' + key;
    return xpathResolve(childPath);
  };
}
