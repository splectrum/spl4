/**
 * stats — context statistics protocol.
 *
 * Read-only. Does not register executions.
 * Counts files, directories, lines, bytes in a
 * target context. Uses mc.data (excludes .spl)
 * and mc.raw (utf-8 reading).
 */

import * as data from '../mc.data/data.js';
import * as raw from '../mc.raw/raw.js';

/**
 * Collect statistics for a target path.
 *
 * Returns plain data: counts and file list.
 */
export async function collect(targetPath) {
  const entries = await data.list(targetPath, { depth: -1 });
  const files = entries.filter(e => e.type === 'file');
  const directories = entries.filter(e => e.type === 'directory');

  let totalLines = 0;
  let totalBytes = 0;
  const fileDetails = [];

  for (const file of files) {
    const name = file.path.split('/').pop();
    try {
      const content = await raw.read(file.path, 'utf-8');
      const lines = content.split('\n').length;
      const bytes = Buffer.byteLength(content, 'utf-8');
      totalLines += lines;
      totalBytes += bytes;
      fileDetails.push({ path: file.path, lines, bytes });
    } catch {
      // binary or unreadable — count bytes only
      const buf = await raw.read(file.path);
      totalBytes += buf.length;
      fileDetails.push({ path: file.path, lines: 0, bytes: buf.length, binary: true });
    }
  }

  return {
    path: targetPath,
    files: files.length,
    directories: directories.length,
    lines: totalLines,
    bytes: totalBytes,
    details: fileDetails
  };
}

/** Format stats as human-readable text */
export function format(stats) {
  const lines = [];
  lines.push(`Stats: ${stats.path}`);
  lines.push(`  ${stats.files} files, ${stats.directories} directories`);
  lines.push(`  ${stats.lines} lines, ${stats.bytes} bytes`);
  if (stats.details.length > 0) {
    lines.push('');
    for (const f of stats.details) {
      const rel = f.path;
      const info = f.binary
        ? `${f.bytes} bytes (binary)`
        : `${f.lines} lines, ${f.bytes} bytes`;
      lines.push(`  ${rel}  ${info}`);
    }
  }
  return lines.join('\n');
}
