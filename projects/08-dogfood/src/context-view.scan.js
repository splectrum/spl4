/**
 * context-view scan — repo scanner using mc protocols.
 *
 * Uses mc.data.list for project discovery (excludes .spl).
 * Uses mc.raw.read for text content (utf-8 format).
 * Root comes from SPL_ROOT environment.
 */

import * as data from '../mc.data/data.js';
import * as raw from '../mc.raw/raw.js';

const MEANINGFUL = new Set(['REQUIREMENTS.md', 'EVALUATION.md']);

/** Scan the repo and collect structured data */
export async function scan() {
  const claudeMd = await raw.read('/CLAUDE.md', 'utf-8');

  // List project directories
  const entries = await data.list('/projects');
  const dirs = entries
    .filter(c => c.type === 'directory')
    .sort((a, b) => a.path.localeCompare(b.path));

  const projects = [];
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];
    const key = dir.path.split('/').pop();

    // List files in project (data view — no .spl)
    const children = await data.list(dir.path);
    const files = children
      .filter(c => c.type === 'file')
      .map(c => c.path.split('/').pop());

    // Read meaningful records
    const records = [];
    for (const name of files) {
      if (MEANINGFUL.has(name)) {
        const content = await raw.read(dir.path + '/' + name, 'utf-8');
        records.push({ name, content });
      }
    }

    projects.push({
      key,
      files,
      records,
      latest: i === dirs.length - 1,
    });
  }

  return { root: process.env.SPL_ROOT, claudeMd, projects };
}

/** Format scan result as text for the haiccer */
export function formatScan(result) {
  const lines = [];
  lines.push('# Scan Result');
  lines.push('');
  if (result.claudeMd) {
    lines.push('## CLAUDE.md');
    lines.push('');
    lines.push(result.claudeMd);
    lines.push('');
  }
  lines.push(`## Projects (${result.projects.length})`);
  lines.push('');
  for (const project of result.projects) {
    const status = project.latest ? '(current)' : '(completed)';
    lines.push(`### ${project.key} ${status}`);
    lines.push('');
    lines.push(`Files: ${project.files.join(', ')}`);
    lines.push('');
    for (const record of project.records) {
      lines.push(`#### ${record.name}`);
      lines.push('');
      lines.push(record.content);
      lines.push('');
    }
  }
  return lines.join('\n');
}
