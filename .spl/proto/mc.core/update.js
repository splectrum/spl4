/**
 * mc.core/update — change existing file content.
 */

import { writeFile } from 'node:fs/promises';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');

  return async function (path, content) {
    const location = await xpathResolve(path);
    if (location.type !== 'file') {
      throw new Error(`mc.core.update: not a file: ${path}`);
    }
    if (location.state !== 'real') {
      throw new Error(`mc.core.update: not real: ${path}`);
    }
    await writeFile(location.address, content);
  };
}
