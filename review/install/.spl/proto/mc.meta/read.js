/**
 * mc.meta/read — read a metadata entry.
 *
 * meta.read('/', 'context.json') reads /.spl/meta/context.json
 */

export default async function (execDoc) {
  const coreRead = await execDoc.resolve('mc.core/read');

  return async function (contextPath, key) {
    return coreRead(metaPath(contextPath, key));
  };
}

function metaPath(contextPath, key) {
  const base = contextPath === '/'
    ? '/.spl/meta'
    : contextPath + '/.spl/meta';
  if (!key) return base;
  return base + '/' + key;
}
