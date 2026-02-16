/**
 * mc.data/list — directory children, excluding .spl entries.
 */

export default async function (execDoc) {
  const coreList = await execDoc.resolve('mc.core/list');

  return async function (path, options) {
    const children = await coreList(path, options);
    return children.filter(c => !c.path.split('/').includes('.spl'));
  };
}
