/**
 * mc.data/read — file content. Errors on .spl paths.
 */

export default async function (execDoc) {
  const coreRead = await execDoc.resolve('mc.core/read');

  return async function (path) {
    if (path.split('/').includes('.spl')) {
      throw new Error(`mc.data.read: .spl paths excluded: ${path}`);
    }
    return coreRead(path);
  };
}
