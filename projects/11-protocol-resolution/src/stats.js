/**
 * stats — context statistics protocol.
 *
 * Read-only. Factory pattern: collect(execDoc) returns
 * a bound operator that takes a target path.
 *
 * Dynamic imports via SPL_ROOT — same pattern as all
 * protocol modules.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SPL_ROOT;
function proto(path) {
  return pathToFileURL(join(root, path)).href;
}

const data = await import(proto('.spl/proto/mc.data/data.js'));
const raw = await import(proto('.spl/proto/mc.raw/raw.js'));

/**
 * collect — factory. Returns operator(targetPath).
 */
export function collect(execDoc) {
  return async function (targetPath = '/') {
    const entries = await data.list(targetPath, { depth: -1 });
    const files = entries.filter(e => e.type === 'file');
    const directories = entries.filter(e => e.type === 'directory');

    let totalLines = 0;
    let totalBytes = 0;
    const details = [];

    for (const file of files) {
      try {
        const content = await raw.read(file.path, 'utf-8');
        const lines = content.split('\n').length;
        const bytes = Buffer.byteLength(content, 'utf-8');
        totalLines += lines;
        totalBytes += bytes;
        details.push({ path: file.path, lines, bytes });
      } catch {
        const buf = await raw.read(file.path);
        totalBytes += buf.length;
        details.push({ path: file.path, lines: 0, bytes: buf.length, binary: true });
      }
    }

    return {
      path: targetPath,
      files: files.length,
      directories: directories.length,
      lines: totalLines,
      bytes: totalBytes,
      details
    };
  };
}

/** Format stats as human-readable text. */
export function format(stats) {
  const lines = [];
  lines.push(`Stats: ${stats.path}`);
  lines.push(`  ${stats.files} files, ${stats.directories} directories`);
  lines.push(`  ${stats.lines} lines, ${stats.bytes} bytes`);
  if (stats.details.length > 0) {
    lines.push('');
    for (const f of stats.details) {
      const info = f.binary
        ? `${f.bytes} bytes (binary)`
        : `${f.lines} lines, ${f.bytes} bytes`;
      lines.push(`  ${f.path}  ${info}`);
    }
  }
  return lines.join('\n');
}
