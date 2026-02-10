/**
 * Changelog logic — extracted from 07's TrackedCapability.
 * Now invoked by the context layer based on metadata mode.
 */

import { createHash } from 'node:crypto';
import type { StorageCapability, ChangelogEntry } from './types.js';

export function fingerprint(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function formatEntry(timestamp: string, operation: string, fp: string): string {
  return `${timestamp}\t${operation}\t${fp}\n`;
}

export function parseChangelog(raw: string, key: string): ChangelogEntry[] {
  return raw.split('\n').filter(Boolean).map(line => {
    const [timestamp, operation, fp] = line.split('\t');
    return {
      timestamp,
      operation: operation as ChangelogEntry['operation'],
      fingerprint: fp,
      key,
    };
  });
}

export function changelogKey(path: string): string {
  return `${path}.changelog`;
}

function keyFromPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

/** Append a changelog entry for a record. */
export async function appendEntry(
  storage: StorageCapability,
  path: string,
  operation: 'created' | 'written',
  content: Buffer,
): Promise<void> {
  const clPath = changelogKey(path);
  const entry = formatEntry(new Date().toISOString(), operation, fingerprint(content));

  let existing = '';
  try {
    existing = (await storage.readRecord(clPath)).toString('utf-8');
  } catch {
    // No changelog yet
  }

  const newLog = existing + entry;
  try {
    await storage.writeRecord(clPath, Buffer.from(newLog));
  } catch {
    await storage.createRecord(clPath, Buffer.from(newLog));
  }
}

/** Delete a changelog for a record. */
export async function deleteChangelog(
  storage: StorageCapability,
  path: string,
): Promise<void> {
  const clPath = changelogKey(path);
  try {
    await storage.readRecord(clPath);
    await storage.deleteRecord(clPath);
  } catch {
    // No changelog
  }
}

/** Read changelog for a single record. */
export async function readLog(
  storage: StorageCapability,
  path: string,
): Promise<ChangelogEntry[]> {
  const clPath = changelogKey(path);
  const raw = (await storage.readRecord(clPath)).toString('utf-8');
  return parseChangelog(raw, keyFromPath(path));
}

/** Cascading changelog read — aggregate all changelogs in a context. */
export async function readContextLog(
  storage: StorageCapability,
  path: string,
): Promise<ChangelogEntry[]> {
  const ctx = await storage.readContext(path);
  const entries: ChangelogEntry[] = [];
  const base = (path && path !== '.') ? path : '';

  for (const rec of ctx.records) {
    if (rec.type === 'file' && rec.key.endsWith('.changelog')) {
      const recPath = base ? `${base}/${rec.key}` : rec.key;
      const raw = (await storage.readRecord(recPath)).toString('utf-8');
      const ownerKey = rec.key.slice(0, -'.changelog'.length);
      entries.push(...parseChangelog(raw, ownerKey));
    }
  }

  return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
