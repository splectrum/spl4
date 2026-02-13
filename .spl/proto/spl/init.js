/**
 * spl/init — rebuild the proto map.
 *
 * Factory pattern: init(execDoc) returns operator.
 * Operator rebuilds the map unconditionally and
 * returns the new map summary.
 *
 * Invoked as: spl spl init
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function init(execDoc) {
  const proto = p => pathToFileURL(join(execDoc.root, p)).href;
  const mapModule = await import(proto('.spl/proto/mc.proto/map.js'));

  return async function () {
    const map = mapModule.rebuild(execDoc.root);
    const keys = Object.keys(map);
    return { rebuilt: true, operations: keys.length, keys };
  };
}

/** Format init result as human-readable text. */
export function format(result) {
  const lines = [`Proto map rebuilt: ${result.operations} operations`];
  for (const key of result.keys) {
    lines.push(`  ${key}`);
  }
  return lines.join('\n');
}
