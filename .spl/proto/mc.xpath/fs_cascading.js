/**
 * fs_cascading — filesystem substrate for cascading references.
 *
 * Filesystem primitives and reference resolution logic.
 * All filesystem access for reference resolution centralised here.
 * P3: shared internal, not registered. P8: direct fs access.
 */

import { stat, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// --- Filesystem primitives ---

export async function safeStat(path) {
  try { return await stat(path); }
  catch { return null; }
}

export async function fileExists(path) {
  return (await safeStat(path)) !== null;
}

export async function dirExists(path) {
  const s = await safeStat(path);
  return s !== null && s.isDirectory();
}

export async function readJSON(path) {
  try {
    const buf = await readFile(path);
    return JSON.parse(buf.toString());
  } catch {
    return null;
  }
}

// --- Reference data ---

/**
 * Read refs.json for a context at the given filesystem address.
 * Returns the parsed refs object or null if none exists.
 */
export async function readRefs(contextAddress) {
  return readJSON(join(contextAddress, '.spl', 'data', 'refs.json'));
}

/**
 * Read hidden.json for a context at the given filesystem address.
 * Returns a Set of hidden names or null if none exists.
 */
export async function readHidden(contextAddress) {
  const arr = await readJSON(join(contextAddress, '.spl', 'data', 'hidden.json'));
  return arr ? new Set(arr) : null;
}

// --- Location helpers ---

/**
 * Build a location object from a stat result.
 */
async function buildLocation(path, address, s, source, ref) {
  const location = { path, address, state: 'real', source: source || 'local' };

  if (ref) location.ref = ref;

  if (s.isFile()) {
    location.type = 'file';
    location.isContext = true;
  } else if (s.isDirectory()) {
    location.type = 'directory';
    location.isContext = await dirExists(join(address, '.spl'));
  }

  return location;
}

// --- Reference resolution ---

/**
 * Resolve a path through references. Called when local
 * resolution fails.
 *
 * Walks path segments forward to find the first missing
 * segment. Checks the ancestor context's refs.json for
 * a matching reference. Tries each layer in order —
 * first layer that resolves wins.
 *
 * @param {string} logical - normalised logical path
 * @param {string} absRoot - absolute filesystem root
 * @returns {object|null} location or null if no reference matches
 */
export async function resolveRef(logical, absRoot) {
  const segments = logical.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  // Walk forward to find the first missing segment
  let ancestorPath = '/';
  let ancestorAddress = absRoot;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const childAddress = join(ancestorAddress, seg);
    const s = await safeStat(childAddress);

    // Segment is missing or hidden — check for reference
    const hidden = await readHidden(ancestorAddress);
    const isHidden = hidden && hidden.has(seg);

    if (s === null || isHidden) {
      const refs = await readRefs(ancestorAddress);
      if (!refs || !refs[seg]) return null;

      // Try each layer in priority order
      const layers = refs[seg];
      const remainder = segments.slice(i + 1);

      for (let layer = 0; layer < layers.length; layer++) {
        const target = layers[layer].target;
        const targetAddress = remainder.length > 0
          ? join(target, ...remainder)
          : target;

        const ts = await safeStat(targetAddress);
        if (ts === null) continue;

        const ref = { context: ancestorPath, name: seg, target, layer };
        return buildLocation(logical, targetAddress, ts, 'reference', ref);
      }

      return null;
    }

    // Segment exists locally and not hidden — advance
    ancestorPath = ancestorPath === '/'
      ? '/' + seg
      : ancestorPath + '/' + seg;
    ancestorAddress = childAddress;
  }

  return null;
}

// --- Layer operations ---

/**
 * Get all locations for a single resource across all layers.
 * Returns ordered array: local (if exists), then each
 * reference layer that has the resource.
 *
 * @param {string} logical - normalised logical path
 * @param {string} absRoot - absolute filesystem root
 * @returns {object[]} array of locations, one per layer
 */
export async function bucket(logical, absRoot) {
  const segments = logical.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const results = [];
  const name = segments[segments.length - 1];
  const parentSegments = segments.slice(0, -1);

  // Resolve the parent context
  const parentPath = parentSegments.length === 0
    ? '/'
    : '/' + parentSegments.join('/');
  const parentAddress = parentSegments.length === 0
    ? absRoot
    : join(absRoot, ...parentSegments);

  // Check local (skip if hidden)
  const hidden = await readHidden(parentAddress);
  const isHidden = hidden && hidden.has(name);
  const localAddress = join(parentAddress, name);
  const ls = await safeStat(localAddress);
  if (ls !== null && !isHidden) {
    results.push(await buildLocation(logical, localAddress, ls, 'local'));
  }

  // Check reference layers at parent
  const refs = await readRefs(parentAddress);
  if (refs && refs[name]) {
    const layers = refs[name];
    for (let i = 0; i < layers.length; i++) {
      const target = layers[i].target;
      const ts = await safeStat(target);
      if (ts !== null) {
        const ref = { context: parentPath, name, target, layer: i };
        results.push(await buildLocation(logical, target, ts, 'reference', ref));
      }
    }
  }

  return results;
}

/**
 * Layer info for a directory context. Returns the directory
 * layers, hidden set, and reference entries — everything
 * mc.core/list needs to do the physical merge.
 *
 * Reads refs.json and hidden.json once per context.
 *
 * @param {string} logical - normalised logical path
 * @param {string} absRoot - absolute filesystem root
 * @returns {object|null} { dirs, hidden, refs } or null
 */
export async function contextLayers(logical, absRoot) {
  let dirs;
  if (logical === '/') {
    const s = await safeStat(absRoot);
    if (!s) return null;
    dirs = [await buildLocation('/', absRoot, s, 'local')];
  } else {
    dirs = (await bucket(logical, absRoot)).filter(d => d.type === 'directory');
  }

  if (dirs.length === 0) return null;

  // Read hidden and refs from the local directory (if exists)
  const localDir = dirs.find(d => d.source === 'local');
  const hidden = localDir ? (await readHidden(localDir.address)) || new Set() : new Set();
  const refs = localDir ? (await readRefs(localDir.address)) || {} : {};

  return { dirs, hidden, refs };
}
