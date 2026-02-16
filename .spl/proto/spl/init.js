/**
 * spl/init — rebuild the proto map.
 *
 * Operator rebuilds the map unconditionally and
 * returns the new map summary.
 *
 * mc.proto/map is boot infrastructure — imported
 * directly because it builds the map that resolve
 * depends on. This is the one legitimate direct
 * import (alongside boot itself).
 *
 * Invoked as: spl spl init
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function (execDoc) {
  const proto = p => pathToFileURL(join(execDoc.root, p)).href;
  const mapModule = await import(proto('.spl/proto/mc.proto/map.js'));

  return async function () {
    const map = mapModule.rebuild(execDoc.root);
    const keys = Object.keys(map);
    return { rebuilt: true, operations: keys.length, keys };
  };
}
