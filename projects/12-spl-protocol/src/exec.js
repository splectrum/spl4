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
 * Root is passed via create(), stored on the doc.
 * No env var dependency.
 *
 * Direct fs — mc.core append not yet implemented.
 * Documented seam, resolved when mc.core gains append.
 */

import { randomUUID } from 'node:crypto';
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
function faf(doc) {
  const dir = dataDir(doc);
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
export function create(protocol, context, root, parentUid = null) {
  const uid = randomUUID();
  const timestamp = new Date().toISOString();

  const doc = {
    uid, protocol, context, root, parentUid,
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
