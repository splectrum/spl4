/**
 * mc.raw — richer structural access.
 *
 * Extends mc.core with format interpretation and
 * (future) compound operations. Still pre-semantic —
 * no meaning in structures. Raw filesystem level.
 *
 * Read: optional format — Buffer (default), 'utf-8', 'json'.
 * Write (create/update): detects content type —
 *   Buffer → binary, string → utf-8, object → JSON.
 *
 * Delegates to mc.core for primitive operations.
 */

import * as core from '../mc.core/core.js';

/**
 * list — directory children with depth-controlled flattening.
 */
export async function list(path, options) {
  return core.list(path, options);
}

/**
 * read — file content with optional format interpretation.
 *
 * raw.read(path)          → Buffer
 * raw.read(path, 'utf-8') → string
 * raw.read(path, 'json')  → parsed object
 */
export async function read(path, format) {
  const buf = await core.read(path);
  if (!format) return buf;
  if (format === 'utf-8') return buf.toString('utf-8');
  if (format === 'json') return JSON.parse(buf.toString('utf-8'));
  throw new Error(`mc.raw.read: unknown format: ${format}`);
}

/**
 * create — make a new entry with format detection.
 *
 * raw.create(parent, key, Buffer)  → binary
 * raw.create(parent, key, string)  → utf-8
 * raw.create(parent, key, object)  → JSON
 * raw.create(parent, key)          → directory
 */
export async function create(parentPath, key, content) {
  return core.create(parentPath, key, toBuffer(content));
}

/**
 * update — change existing file with format detection.
 *
 * raw.update(path, Buffer)  → binary
 * raw.update(path, string)  → utf-8
 * raw.update(path, object)  → JSON
 */
export async function update(path, content) {
  return core.update(path, toBuffer(content));
}

/**
 * del — remove an entry. Recursive for directories.
 */
export async function del(path) {
  return core.del(path);
}

/**
 * Convert content to Buffer for mc.core.
 * undefined → undefined (directory creation)
 * Buffer → passthrough
 * string → utf-8 encoded
 * object → JSON serialized
 */
function toBuffer(content) {
  if (content === undefined) return undefined;
  if (Buffer.isBuffer(content)) return content;
  if (typeof content === 'string') return Buffer.from(content, 'utf-8');
  return Buffer.from(JSON.stringify(content, null, 2), 'utf-8');
}
