/**
 * mc.exec — execution store protocol.
 *
 * Fire-and-forget (faf) persistence of execution docs.
 * Drop the data, move on. Each drop is immutable.
 *
 * The doc is a plain object the protocol enriches
 * with inputs, config, and results. mc.exec manages
 * identity and persistence, not doc structure.
 *
 * Drops are named <ms-since-epoch>-<seq>.json.
 * Temporal, sortable, no collisions.
 *
 * Store structure:
 *   .spl/exec/data/<proto>/<uid>/<timestamp-seq>.json
 *
 * Direct fs — mc.core append not yet implemented.
 * Documented seam, resolved when mc.core gains append.
 */

import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function root() {
  const r = process.env.SPL_ROOT;
  if (!r) throw new Error('mc.exec: SPL_ROOT not set');
  return r;
}

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

function dataDir(context, protocol, uid) {
  const contextDir = context === '/'
    ? root()
    : join(root(), context.slice(1));
  return join(contextDir, '.spl', 'exec', 'data', protocol, uid);
}

function ensureDir(dir) {
  if (!existsSync(dir))
    mkdirSync(dir, { recursive: true });
}

/** Fire-and-forget drop — write and move on */
function faf(doc) {
  const dir = dataDir(doc.context, doc.protocol, doc.uid);
  ensureDir(dir);
  const name = timestampName();
  writeFileSync(
    join(dir, `${name}.json`),
    JSON.stringify(doc, null, 2)
  );
}

/**
 * create — start a new execution.
 *
 * Returns the execution doc with identity fields.
 * The protocol enriches it with inputs and config
 * before processing.
 *
 * Faf drop: boundary entry.
 */
export function create(protocol, context, parentUid = null) {
  const uid = randomUUID();
  const timestamp = new Date().toISOString();

  const doc = {
    uid, protocol, context, parentUid,
    timestamp, status: 'running'
  };

  faf(doc);
  return doc;
}

/**
 * drop — persist the doc at this moment.
 *
 * Internal step capture. The full doc is written —
 * not a delta, not an event. Complete state at this
 * point. Fire and forget.
 */
export function drop(doc) {
  faf(doc);
}

/**
 * complete — mark execution as completed.
 *
 * Faf drop: boundary exit.
 */
export function complete(doc) {
  doc.status = 'completed';
  doc.completedAt = new Date().toISOString();
  faf(doc);
}

/**
 * fail — mark execution as failed.
 *
 * Faf drop: boundary exit.
 */
export function fail(doc, error = null) {
  doc.status = 'failed';
  doc.failedAt = new Date().toISOString();
  if (error) doc.error = error;
  faf(doc);
}
