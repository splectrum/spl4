/**
 * mc.meta/list — list metadata entries for a context.
 *
 * meta.list('/projects') lists /projects/.spl/meta/ children
 */

export default async function (execDoc) {
  const coreList = await execDoc.resolve('mc.core/list');

  return async function (contextPath, options) {
    return coreList(metaPath(contextPath), options);
  };
}

function metaPath(contextPath, key) {
  const base = contextPath === '/'
    ? '/.spl/meta'
    : contextPath + '/.spl/meta';
  if (!key) return base;
  return base + '/' + key;
}
