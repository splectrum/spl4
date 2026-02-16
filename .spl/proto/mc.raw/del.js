/**
 * mc.raw/del — remove an entry. Recursive for directories.
 * Delegates to mc.core/del.
 */

export default async function (execDoc) {
  const coreDel = await execDoc.resolve('mc.core/del');

  return async function (path) {
    return coreDel(path);
  };
}
