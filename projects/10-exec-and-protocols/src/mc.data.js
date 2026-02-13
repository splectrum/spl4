/**
 * mc.data — user data view.
 *
 * Thin filter on mc.core. Excludes .spl from all
 * operations. Everything the user sees as "their data."
 *
 * Semantic layer: structure has meaning here.
 * .spl is infrastructure, not data.
 */

import * as core from '../mc.core/core.js';

function isSplPath(path) {
  const segments = path.split('/');
  return segments.includes('.spl');
}

function assertNotSpl(path, op) {
  if (isSplPath(path)) {
    throw new Error(`mc.data.${op}: .spl paths excluded: ${path}`);
  }
}

/**
 * list — directory children, excluding .spl entries.
 */
export async function list(path, options) {
  const children = await core.list(path, options);
  return children.filter(c => !isSplPath(c.path));
}

/**
 * read — file content. Errors on .spl paths.
 */
export async function read(path) {
  assertNotSpl(path, 'read');
  return core.read(path);
}

/**
 * create — make a new entry. Errors on .spl paths.
 */
export async function create(parentPath, key, content) {
  if (key === '.spl' || key.startsWith('.spl/')) {
    throw new Error(`mc.data.create: .spl paths excluded: ${key}`);
  }
  assertNotSpl(parentPath, 'create');
  return core.create(parentPath, key, content);
}

/**
 * update — change existing file. Errors on .spl paths.
 */
export async function update(path, content) {
  assertNotSpl(path, 'update');
  return core.update(path, content);
}

/**
 * del — remove an entry. Errors on .spl paths.
 */
export async function del(path) {
  assertNotSpl(path, 'del');
  return core.del(path);
}
