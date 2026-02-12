/**
 * mc.proto boot — the one bootstrap protocol.
 *
 * Direct file access. Assumes filesystem substrate
 * and cwd = repo root. Stateless — root as parameter.
 *
 * Resolves protocol name → config from .spl/proto/.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function resolve(root, name) {
  const path = join(root, '.spl', 'proto', name, 'config.json');
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    throw new Error(`mc.proto: cannot resolve "${name}" — ${e.message}`);
  }
}
