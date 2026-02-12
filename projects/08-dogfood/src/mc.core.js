/**
 * mc.core — five primitive operations.
 *
 * The stable foundation. Stateless. Minimal.
 * Uses mc.xpath internally for path resolution.
 * Reads SPL_ROOT from environment.
 *
 * Returns opaque bytes. No format interpretation.
 * No compound operations. Primitives only.
 */

import { resolve as xpathResolve } from '../mc.xpath/resolve.js';
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * list — directory children with depth-controlled flattening.
 * Non-context directories (no .spl/) flatten through up to depth.
 * depth 0 = immediate children (default). depth -1 = infinite.
 */
export async function list(path, options) {
  const location = await xpathResolve(path);
  if (location.type !== 'directory') {
    throw new Error(`mc.core.list: not a directory: ${path}`);
  }
  const depth = options?.depth ?? 0;
  return listAtDepth(location, depth);
}

async function listAtDepth(location, depth) {
  const entries = await readdir(location.address, { withFileTypes: true });
  const result = [];

  for (const e of entries) {
    const childPath = location.path === '/'
      ? '/' + e.name
      : location.path + '/' + e.name;
    const child = await xpathResolve(childPath);

    if (child.type === 'directory' && !child.isContext && depth !== 0) {
      const nextDepth = depth === -1 ? -1 : depth - 1;
      result.push(...await listAtDepth(child, nextDepth));
    } else {
      result.push(child);
    }
  }

  return result;
}

/**
 * read — content as opaque bytes. Files only.
 */
export async function read(path) {
  const location = await xpathResolve(path);
  if (location.type !== 'file') {
    throw new Error(`mc.core.read: not a file: ${path}`);
  }
  return readFile(location.address);
}

/**
 * create — make a new entry.
 * File if content provided, directory if not.
 * Operates on parent — the thing being created doesn't exist yet.
 */
export async function create(parentPath, key, content) {
  const parent = await xpathResolve(parentPath);
  if (parent.type !== 'directory') {
    throw new Error(`mc.core.create: parent not a directory: ${parentPath}`);
  }

  const targetAddress = join(parent.address, key);
  if (content !== undefined) {
    await writeFile(targetAddress, content);
  } else {
    await mkdir(targetAddress, { recursive: true });
  }

  const childPath = parent.path === '/'
    ? '/' + key
    : parent.path + '/' + key;
  return xpathResolve(childPath);
}

/**
 * update — change existing file content.
 */
export async function update(path, content) {
  const location = await xpathResolve(path);
  if (location.type !== 'file') {
    throw new Error(`mc.core.update: not a file: ${path}`);
  }
  if (location.state !== 'real') {
    throw new Error(`mc.core.update: not real: ${path}`);
  }
  await writeFile(location.address, content);
}

/**
 * del — remove an entry. Recursive for directories.
 */
export async function del(path) {
  const location = await xpathResolve(path);
  if (location.state !== 'real') {
    throw new Error(`mc.core.del: not real: ${path}`);
  }
  await rm(location.address, { recursive: true, force: true });
}
