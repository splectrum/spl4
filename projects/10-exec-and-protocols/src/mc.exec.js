/**
 * mc.exec — execution store protocol.
 *
 * Manages the execution document lifecycle:
 * create → enrich → snapshot → complete/fail.
 *
 * The doc is a plain object the protocol enriches
 * with inputs, config, and results. mc.exec manages
 * identity and persistence, not doc structure.
 *
 * Global log (/.spl/exec/log): lean JSONL entries.
 * Identity, status, timestamps. Source of truth for
 * lifecycle. Small, fast, suitable for locking.
 *
 * Local store (<context>/.spl/exec/<proto>/<uid>/):
 * full doc snapshots. start.json, end.json, plus
 * any additional snapshots the protocol requests.
 *
 * Direct fs — mc.core lacks append. Documented seam.
 */

import { randomUUID } from 'node:crypto';
import {
  appendFileSync, writeFileSync,
  mkdirSync, existsSync
} from 'node:fs';
import { join } from 'node:path';

function root() {
  const r = process.env.SPL_ROOT;
  if (!r) throw new Error('mc.exec: SPL_ROOT not set');
  return r;
}

function logFile() {
  return join(root(), '.spl', 'exec', 'log');
}

function localDir(context, protocol, uid) {
  const contextDir = context === '/'
    ? root()
    : join(root(), context.slice(1));
  return join(contextDir, '.spl', 'exec', protocol, uid);
}

function ensureDir(dir) {
  if (!existsSync(dir))
    mkdirSync(dir, { recursive: true });
}

/** Append lean entry to global log (atomic for small writes) */
function appendLog(entry) {
  ensureDir(join(root(), '.spl', 'exec'));
  appendFileSync(logFile(), JSON.stringify(entry) + '\n');
}

/** Persist full doc snapshot to local store */
function persistSnapshot(doc, label) {
  const dir = localDir(doc.context, doc.protocol, doc.uid);
  ensureDir(dir);
  writeFileSync(
    join(dir, `${label}.json`),
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
 * Writes lean entry to global log (source of truth).
 * Snapshots the doc as start.json.
 */
export function create(protocol, context, parentUid = null) {
  const uid = randomUUID();
  const timestamp = new Date().toISOString();

  const doc = {
    uid, protocol, context, parentUid,
    timestamp, status: 'running'
  };

  // Global log first (source of truth)
  appendLog({
    uid, protocol, context, parentUid,
    timestamp, status: 'running'
  });

  // Local snapshot
  persistSnapshot(doc, 'start');

  return doc;
}

/**
 * snapshot — persist the doc at this moment.
 *
 * Label identifies the snapshot (e.g. step name,
 * sequence number). The full doc is written — not
 * a delta, not an event. Complete state at this point.
 */
export function snapshot(doc, label = 'snapshot') {
  persistSnapshot(doc, label);
}

/**
 * complete — mark execution as completed.
 *
 * Snapshots the final doc as end.json.
 * Appends completion to global log.
 */
export function complete(doc) {
  const timestamp = new Date().toISOString();
  doc.status = 'completed';
  doc.completedAt = timestamp;

  persistSnapshot(doc, 'end');
  appendLog({ uid: doc.uid, status: 'completed', timestamp });
}

/**
 * fail — mark execution as failed.
 *
 * Snapshots the final doc as end.json.
 * Appends failure to global log.
 */
export function fail(doc, error = null) {
  const timestamp = new Date().toISOString();
  doc.status = 'failed';
  doc.failedAt = timestamp;
  if (error) doc.error = error;

  persistSnapshot(doc, 'end');
  appendLog({
    uid: doc.uid, status: 'failed', timestamp, error
  });
}
