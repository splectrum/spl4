/**
 * mc.proto/resolve — protocol operation resolver.
 *
 * Factory takes exec doc (needs root + map), returns
 * resolver function. The resolver looks up the map,
 * imports the module, calls the default export factory
 * with the exec doc, caches the operator, returns it.
 *
 * Boot imports this directly (bootstrap) and attaches
 * the result to the exec doc as doc.resolve.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function (execDoc) {
  const _resolved = {};

  return async function (key) {
    if (_resolved[key]) return _resolved[key];
    const regs = execDoc.map[key];
    if (!regs || regs.length === 0) throw new Error(`resolve: "${key}" not found`);
    const cfg = regs[0].config;
    const mod = await import(pathToFileURL(join(execDoc.root, cfg.module)).href);
    const factory = mod.default;
    if (typeof factory !== 'function') {
      throw new Error(`resolve: "${key}" default export is not a function`);
    }
    const operator = await factory(execDoc);
    _resolved[key] = operator;
    return operator;
  };
}
