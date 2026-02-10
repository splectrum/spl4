/**
 * Context traversal — accumulates metadata along a path.
 */

import type { Metadata, ContextDefs } from './types.js';

const DEFAULTS: Metadata = {
  mutable: 'true',
  mode: 'none',
  flat: 'false',
};

/**
 * Traverse a path and accumulate metadata from context definitions.
 *
 * Walks each segment of the path. At each context, merges its
 * metadata into the accumulator (nearest distance wins — later
 * values override earlier). When a context has flat: true,
 * traversal stops accumulating — remaining segments are content
 * within that flat context.
 *
 * Returns the accumulated metadata for the target.
 */
export function traverse(path: string, defs: ContextDefs): Metadata {
  const meta: Metadata = { ...DEFAULTS };

  // Root context metadata (empty path)
  if (defs[''] || defs['.']) {
    Object.assign(meta, defs[''] || defs['.']);
  }

  const parts = path.split('/').filter(Boolean);
  let current = '';

  for (let i = 0; i < parts.length; i++) {
    current = current ? `${current}/${parts[i]}` : parts[i];

    const contextMeta = defs[current];
    if (contextMeta) {
      Object.assign(meta, contextMeta);
    }

    // If this context is flat, stop accumulating
    if (meta.flat === 'true') {
      break;
    }
  }

  return meta;
}
