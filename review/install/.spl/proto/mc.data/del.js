/**
 * mc.data/del — remove an entry. Errors on .spl paths.
 */

export default async function (execDoc) {
  const coreDel = await execDoc.resolve('mc.core/del');

  return async function (path) {
    if (path.split('/').includes('.spl')) {
      throw new Error(`mc.data.del: .spl paths excluded: ${path}`);
    }
    return coreDel(path);
  };
}
