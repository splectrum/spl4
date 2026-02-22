/**
 * mc.xpath/resolve — location resolver.
 *
 * Factory: default export takes execDoc, returns bound operator.
 * Resolves logical paths to location pointers.
 *
 * Filesystem substrate. Reference resolution via fs_cascading.
 *
 * operator(path)        → top-priority location (for read/write)
 * operator.layers(path) → { dirs, hidden, refs } for mc.core/list
 * operator.bucket(path) → all layers for one resource
 */

import { join, resolve as pathResolve } from 'node:path';
import { safeStat, dirExists, readHidden, resolveRef, bucket, contextLayers } from './fs_cascading.js';

export default async function (execDoc) {
  const absRoot = pathResolve(execDoc.root);

  const operator = async function (path) {
    const logical = normalise(path);
    const address = logical === '/'
      ? absRoot
      : join(absRoot, logical.slice(1));

    const s = await safeStat(address);

    if (s !== null) {
      // Check if hidden in parent context
      let isHidden = false;
      if (logical !== '/') {
        const segments = logical.split('/').filter(Boolean);
        const name = segments[segments.length - 1];
        const parentAddress = segments.length === 1
          ? absRoot
          : join(absRoot, ...segments.slice(0, -1));
        const hidden = await readHidden(parentAddress);
        isHidden = hidden && hidden.has(name);
      }

      if (!isHidden) {
        if (s.isFile()) {
          return { path: logical, address, state: 'real', type: 'file', isContext: true, source: 'local' };
        }

        if (s.isDirectory()) {
          const hasSpl = await dirExists(join(address, '.spl'));
          return { path: logical, address, state: 'real', type: 'directory', isContext: hasSpl, source: 'local' };
        }

        throw new Error(`mc.xpath: unsupported entry type: ${logical}`);
      }
    }

    // Local miss or hidden — try reference resolution
    const refLoc = await resolveRef(logical, absRoot);
    if (refLoc) return refLoc;

    throw new Error(`mc.xpath: not found: ${logical}`);
  };

  /**
   * Layer info for a directory context. Returns dirs, hidden,
   * and refs — everything mc.core/list needs to do the merge.
   * Reads refs.json and hidden.json once per context.
   */
  operator.layers = async function (path) {
    const logical = normalise(path);
    return contextLayers(logical, absRoot);
  };

  /**
   * All locations for a single resource across all layers.
   * Ordered: local (if exists), then each reference layer.
   */
  operator.bucket = async function (path) {
    const logical = normalise(path);
    return bucket(logical, absRoot);
  };

  return operator;
}

function normalise(path) {
  if (path === '' || path === '/' || path === '.') return '/';
  const clean = path.startsWith('/') ? path : '/' + path;
  return clean.endsWith('/') ? clean.slice(0, -1) : clean;
}
