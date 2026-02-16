/**
 * mc.meta/del — delete a metadata entry.
 *
 * meta.del('/', 'context.json')
 */

export default async function (execDoc) {
  const coreDel = await execDoc.resolve('mc.core/del');

  return async function (contextPath, key) {
    return coreDel(metaPath(contextPath, key));
  };
}

function metaPath(contextPath, key) {
  const base = contextPath === '/'
    ? '/.spl/meta'
    : contextPath + '/.spl/meta';
  if (!key) return base;
  return base + '/' + key;
}
