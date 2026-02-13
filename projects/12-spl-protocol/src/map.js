/**
 * mc.proto/map — protocol map builder and resolver.
 *
 * Scans .spl/proto/ directories across the repo.
 * Protocols contain operation subdirectories, each
 * with a config.json. Map keys are "protocol/operation".
 *
 * Module-level cache: ensure() loads the map once,
 * resolve() uses it. The module cache persists the
 * code; the module-level variable persists the data.
 *
 * No staleness detection — the process that changes
 * registrations calls rebuild(). Next process loads
 * the fresh map.json at boot.
 *
 * All functions take root as parameter — no env vars.
 * Map stored at .spl/exec/state/mc/proto/map.json.
 */

import {
  readdirSync, readFileSync, writeFileSync,
  mkdirSync, existsSync
} from 'node:fs';
import { join } from 'node:path';

/** Module-level map cache */
let _map = null;

const MAP_REL = join('.spl', 'exec', 'state', 'mc', 'proto');

function mapDir(root) { return join(root, MAP_REL); }
function mapFile(root) { return join(mapDir(root), 'map.json'); }

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

/** Build the proto map from filesystem. */
export function build(root) {
  const entries = walk(root, '/');
  const map = {};
  for (const { key, context, config } of entries) {
    if (!map[key]) map[key] = [];
    map[key].push({ context, config });
  }
  return map;
}

/** Persist the map to disk. */
export function save(root, map) {
  const dir = mapDir(root);
  if (!existsSync(dir))
    mkdirSync(dir, { recursive: true });
  writeFileSync(mapFile(root), JSON.stringify(map, null, 2));
}

/** Load the map from disk. Returns null if missing. */
export function load(root) {
  const file = mapFile(root);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch { return null; }
}

/**
 * Ensure map is available. Returns cached, or loads
 * from disk, or builds from filesystem.
 */
export function ensure(root) {
  if (_map) return _map;
  _map = load(root);
  if (_map) return _map;
  _map = build(root);
  save(root, _map);
  return _map;
}

/**
 * Rebuild the map unconditionally. For spl/init.
 * Updates module-level cache and persists to disk.
 */
export function rebuild(root) {
  _map = build(root);
  save(root, _map);
  return _map;
}

/**
 * Resolve protocol/operation for a target path.
 * Uses module-level cached map.
 * Single registration: return it directly.
 * Multiple: longest prefix match.
 */
export function resolve(key, targetPath = '/') {
  if (!_map) throw new Error('proto map not loaded — call ensure() first');
  const registrations = _map[key];
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
