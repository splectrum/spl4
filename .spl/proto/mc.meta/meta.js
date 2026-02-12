/**
 * mc.meta — metadata view.
 *
 * Thin filter on mc.core. Scoped to .spl/meta/ of
 * any context. Caller addresses relative to the
 * context — this filter adds the .spl/meta/ prefix.
 *
 * Semantic layer: metadata access.
 */

import * as core from '../mc.core/core.js';

/**
 * Resolve the .spl/meta/ path for a context.
 * contextPath: the context (e.g. '/', '/projects')
 * key: optional subpath within .spl/meta/
 */
function metaPath(contextPath, key) {
  const base = contextPath === '/'
    ? '/.spl/meta'
    : contextPath + '/.spl/meta';
  if (!key) return base;
  return base + '/' + key;
}

/**
 * list — list metadata entries for a context.
 *
 * meta.list('/projects') lists /projects/.spl/meta/ children
 */
export async function list(contextPath, options) {
  return core.list(metaPath(contextPath), options);
}

/**
 * read — read a metadata entry.
 *
 * meta.read('/', 'context.json') reads /.spl/meta/context.json
 */
export async function read(contextPath, key) {
  return core.read(metaPath(contextPath, key));
}

/**
 * create — create a metadata entry.
 *
 * meta.create('/', 'context.json', content)
 */
export async function create(contextPath, key, content) {
  return core.create(metaPath(contextPath), key, content);
}

/**
 * update — update a metadata entry.
 *
 * meta.update('/', 'context.json', content)
 */
export async function update(contextPath, key, content) {
  return core.update(metaPath(contextPath, key), content);
}

/**
 * del — delete a metadata entry.
 *
 * meta.del('/', 'context.json')
 */
export async function del(contextPath, key) {
  return core.del(metaPath(contextPath, key));
}
