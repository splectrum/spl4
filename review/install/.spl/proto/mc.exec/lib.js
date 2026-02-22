/**
 * mc.exec/lib — shared internals for exec operations.
 *
 * Fire-and-forget persistence. Not a registered operation.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Sequence counter for same-ms deduplication */
let lastMs = 0;
let seq = 0;

function timestampName() {
  const ms = Date.now();
  if (ms === lastMs) {
    seq++;
  } else {
    lastMs = ms;
    seq = 0;
  }
  return `${ms}-${seq}`;
}

function dataDir(doc) {
  const contextDir = doc.context === '/'
    ? doc.root
    : join(doc.root, doc.context.slice(1));
  return join(contextDir, '.spl', 'exec', 'data', doc.protocol, doc.uid);
}

function ensureDir(dir) {
  if (!existsSync(dir))
    mkdirSync(dir, { recursive: true });
}

/** Fire-and-forget drop — write and move on */
export function faf(doc) {
  const dir = dataDir(doc);
  ensureDir(dir);
  const name = timestampName();
  writeFileSync(
    join(dir, `${name}.json`),
    JSON.stringify(doc, null, 2)
  );
}
