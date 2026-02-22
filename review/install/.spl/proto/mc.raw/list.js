/**
 * mc.raw/list — directory children with depth-controlled flattening.
 * Delegates to mc.core/list.
 */

export default async function (execDoc) {
  const coreList = await execDoc.resolve('mc.core/list');

  return async function (path, options) {
    return coreList(path, options);
  };
}
