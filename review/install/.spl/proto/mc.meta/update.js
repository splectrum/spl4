/**
 * mc.meta/update — update a metadata entry.
 *
 * meta.update('/', 'context.json', content)
 */

export default async function (execDoc) {
  const coreUpdate = await execDoc.resolve('mc.core/update');

  return async function (contextPath, key, content) {
    return coreUpdate(metaPath(contextPath, key), content);
  };
}

function metaPath(contextPath, key) {
  const base = contextPath === '/'
    ? '/.spl/meta'
    : contextPath + '/.spl/meta';
  if (!key) return base;
  return base + '/' + key;
}
