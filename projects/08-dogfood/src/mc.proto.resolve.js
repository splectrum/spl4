/**
 * mc.proto — proper protocol resolver.
 *
 * Uses mc.core.read instead of direct file access.
 * Substrate-agnostic. Replaces boot after bootstrap.
 */

import { read } from '../mc.core/core.js';

export async function resolve(name) {
  const configPath = `/.spl/proto/${name}/config.json`;
  try {
    const content = await read(configPath);
    return JSON.parse(content.toString('utf-8'));
  } catch (e) {
    throw new Error(`mc.proto: cannot resolve "${name}" — ${e.message}`);
  }
}
