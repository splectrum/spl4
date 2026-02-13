/**
 * mc.proto/map — protocol map builder and resolver.
 *
 * Scans .spl/proto/ directories across the repo.
 * Protocols contain operation subdirectories, each
 * with a config.json. Map keys are "protocol/operation".
 *
 * Resolves by longest prefix match of target path.
 * Single registration: returns it directly.
 *
 * Map stored at .spl/exec/state/mc/proto/map.json.
 */

import {
  readdirSync, readFileSync, writeFileSync,
  mkdirSync, existsSync, statSync
} from 'node:fs';
import { join } from 'node:path';

const root = process.env.SPL_ROOT;

const MAP_DIR = join(root, '.spl', 'exec', 'state', 'mc', 'proto');
const MAP_FILE = join(MAP_DIR, 'map.json');

/**
 * Scan .spl/proto/<protocol>/<operation>/config.json
 */
function scanProtoDir(protoDir, contextPath) {
  if (!existsSync(protoDir)) return [];
  const entries = [];
  for (const proto of readdirSync(protoDir, { withFileTypes: true })) {
    if (!proto.isDirectory()) continue;
    const protoPath = join(protoDir, proto.name);
    for (const op of readdirSync(protoPath, { withFileTypes: true })) {
      if (!op.isDirectory()) continue;
      const configPath = join(protoPath, op.name, 'config.json');
      if (existsSync(configPath)) {
        try {
          const config = JSON.parse(readFileSync(configPath, 'utf-8'));
          entries.push({
            key: `${proto.name}/${op.name}`,
            context: contextPath,
            config
          });
        } catch { /* skip malformed */ }
      }
    }
  }
  return entries;
}

/**
 * Walk the repo for .spl/proto/ directories.
 */
function walk(dir, contextPath) {
  const results = [];
  const protoDir = join(dir, '.spl', 'proto');
  if (existsSync(protoDir)) {
    results.push(...scanProtoDir(protoDir, contextPath));
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '.spl' || entry.name === 'node_modules'
        || entry.name === '.git' || entry.name === 'dist') continue;
    const childPath = contextPath === '/'
      ? `/${entry.name}`
      : `${contextPath}/${entry.name}`;
    results.push(...walk(join(dir, entry.name), childPath));
  }
  return results;
}

/** Build the proto map. */
export function build() {
  const entries = walk(root, '/');
  const map = {};
  for (const { key, context, config } of entries) {
    if (!map[key]) map[key] = [];
    map[key].push({ context, config });
  }
  return map;
}

/** Persist the map. */
export function save(map) {
  if (!existsSync(MAP_DIR))
    mkdirSync(MAP_DIR, { recursive: true });
  writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
}

/** Load the map. Returns null if missing. */
export function load() {
  if (!existsSync(MAP_FILE)) return null;
  try {
    return JSON.parse(readFileSync(MAP_FILE, 'utf-8'));
  } catch { return null; }
}

/** Check if map needs rebuilding. */
export function isStale() {
  if (!existsSync(MAP_FILE)) return true;
  const mapMtime = statSync(MAP_FILE).mtimeMs;
  return checkNewer(root, mapMtime);
}

function checkNewer(dir, threshold) {
  const protoDir = join(dir, '.spl', 'proto');
  if (existsSync(protoDir)) {
    if (statSync(protoDir).mtimeMs > threshold) return true;
    for (const entry of readdirSync(protoDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const d = join(protoDir, entry.name);
        if (statSync(d).mtimeMs > threshold) return true;
      }
    }
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '.spl' || entry.name === 'node_modules'
        || entry.name === '.git' || entry.name === 'dist') continue;
    if (checkNewer(join(dir, entry.name), threshold)) return true;
  }
  return false;
}

/** Ensure map is current. Returns the map. */
export function ensure() {
  if (!isStale()) {
    const cached = load();
    if (cached) return cached;
  }
  const map = build();
  save(map);
  return map;
}

/**
 * Resolve protocol/operation for a target path.
 * Single registration: return it directly.
 * Multiple: longest prefix match.
 */
export function resolve(map, key, targetPath = '/') {
  const registrations = map[key];
  if (!registrations || registrations.length === 0) return null;
  if (registrations.length === 1) return registrations[0];

  let best = null;
  for (const reg of registrations) {
    const ctx = reg.context;
    const matches = targetPath === ctx
      || targetPath.startsWith(ctx === '/' ? '/' : ctx + '/')
      || ctx === '/';
    if (matches && (!best || ctx.length > best.context.length)) {
      best = reg;
    }
  }
  return best || null;
}
