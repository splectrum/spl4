/**
 * mc.data/update — change existing file. Errors on .spl paths.
 */

export default async function (execDoc) {
  const coreUpdate = await execDoc.resolve('mc.core/update');

  return async function (path, content) {
    if (path.split('/').includes('.spl')) {
      throw new Error(`mc.data.update: .spl paths excluded: ${path}`);
    }
    return coreUpdate(path, content);
  };
}
