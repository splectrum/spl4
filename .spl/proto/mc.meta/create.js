/**
 * mc.meta/create — create a metadata entry.
 *
 * meta.create('/', 'context.json', content)
 */

export default async function (execDoc) {
  const coreCreate = await execDoc.resolve('mc.core/create');

  return async function (contextPath, key, content) {
    return coreCreate(metaPath(contextPath), key, content);
  };
}

function metaPath(contextPath) {
  return contextPath === '/'
    ? '/.spl/meta'
    : contextPath + '/.spl/meta';
}
