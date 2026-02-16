/**
 * mc.core/create — make a new entry.
 *
 * File if content provided, directory if not.
 * Operates on parent — the thing being created doesn't exist yet.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');

  return async function (parentPath, key, content) {
    const parent = await xpathResolve(parentPath);
    if (parent.type !== 'directory') {
      throw new Error(`mc.core.create: parent not a directory: ${parentPath}`);
    }

    const targetAddress = join(parent.address, key);
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
