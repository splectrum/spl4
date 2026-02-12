/**
 * mc.proto boot — the one bootstrap protocol.
 *
 * Direct file access. Assumes filesystem substrate
 * and cwd = repo root. Reads SPL_ROOT from environment.
 *
 * Resolves protocol name → config from .spl/proto/.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function resolve(name) {
  const root = process.env.SPL_ROOT;
  if (!root) throw new Error('mc.proto.boot: SPL_ROOT not set');
  const path = join(root, '.spl', 'proto', name, 'config.json');
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    throw new Error(`mc.proto: cannot resolve "${name}" — ${e.message}`);
  }
}
