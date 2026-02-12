/**
 * mc.xpath — location resolver.
 *
 * Stateless. Resolves logical paths to location pointers.
 * Root passed as parameter, not captured.
 *
 * Filesystem substrate today.
 * Later: cascading references, layering, wider syntax.
 */

import { stat } from 'node:fs/promises';
import { join, resolve as pathResolve } from 'node:path';

export async function resolve(root, path) {
  const logical = normalise(path);
  const absRoot = pathResolve(root);
  const address = logical === '/'
    ? absRoot
    : join(absRoot, logical.slice(1));

  const s = await safeStat(address);

  if (s === null) {
    throw new Error(`mc.xpath: not found: ${logical}`);
  }

  if (s.isFile()) {
    return { path: logical, address, state: 'real', type: 'file', isContext: true };
  }

  if (s.isDirectory()) {
    const hasSpl = await dirExists(join(address, '.spl'));
    return { path: logical, address, state: 'real', type: 'directory', isContext: hasSpl };
  }

  throw new Error(`mc.xpath: unsupported entry type: ${logical}`);
}

function normalise(path) {
  if (path === '' || path === '/' || path === '.') return '/';
  const clean = path.startsWith('/') ? path : '/' + path;
  return clean.endsWith('/') ? clean.slice(0, -1) : clean;
}

async function safeStat(path) {
  try { return await stat(path); }
  catch { return null; }
}

async function dirExists(path) {
  const s = await safeStat(path);
  return s !== null && s.isDirectory();
}
