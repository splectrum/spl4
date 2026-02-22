/**
 * context-view/lib — shared internals.
 *
 * Scan logic, prompt building, haiccer invocation.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const MEANINGFUL = new Set(['REQUIREMENTS.md', 'EVALUATION.md']);

const PROMPT_TEMPLATE = `Generate a context description from the scan data below.

Output ONLY the raw markdown content. No code fences, no
commentary, no explanation. Just the document.

Structure:

# Context

## Current: <project title>

A brief summary (2-4 lines) of what the current project
is doing and where it stands. Headline + summary style.

See projects/<key>/

## Completed

For each completed project (most recent first):
<project title> — one line summary of outcome
  See projects/<key>/EVALUATION.md

Rules:
- Output raw markdown only — no wrapping, no commentary
- Be concise and neutral — report, don't interpret
- Use the project's own language, don't invent
- Current project gets the magnifying glass (more detail)
- Completed projects get headline + reference only
- No vocabulary sections, no reading order, no intro
`;

/** Scan the repo and collect structured data */
export async function doScan(dataList, rawRead, root) {
  const claudeMd = await rawRead('/CLAUDE.md', 'utf-8');

  const entries = await dataList('/projects');
  const dirs = entries
    .filter(c => c.type === 'directory')
    .sort((a, b) => a.path.localeCompare(b.path));

  const projects = [];
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];
    const key = dir.path.split('/').pop();

    const children = await dataList(dir.path);
    const files = children
      .filter(c => c.type === 'file')
      .map(c => c.path.split('/').pop());

    const records = [];
    for (const name of files) {
      if (MEANINGFUL.has(name)) {
        const content = await rawRead(dir.path + '/' + name, 'utf-8');
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

  return { root, claudeMd, projects };
}

/** Format scan result as text */
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

/** Build the haiccer prompt */
export function buildPrompt(result) {
  return `${PROMPT_TEMPLATE}\n---\n\n${formatScan(result)}`;
}

/** Write prompt to .context-view/ transient directory */
export function writePrompt(root, prompt) {
  const dir = join(root, '.context-view');
  if (!existsSync(dir))
    mkdirSync(dir, { recursive: true });
  const path = join(dir, 'prompt.md');
  writeFileSync(path, prompt);
  return path;
}

/** Invoke the haiccer (claude CLI) */
export function invokeHaiccer(promptPath) {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  const result = execSync(
    `cat "${promptPath}" | claude --print --model haiku`,
    { encoding: 'utf-8', maxBuffer: 1024 * 1024, env }
  );
  return result.trim();
}

/** Clean haiccer output */
export function clean(content) {
  let text = content;
  const idx = text.indexOf('# Context');
  if (idx > 0)
    text = text.slice(idx);
  text = text.replace(/^```\w*\n?/gm, '').replace(/\n?```\s*$/g, '');
  const lines = text.trim().split('\n');
  while (lines.length > 0) {
    const last = lines[lines.length - 1].trim();
    if (last === '' || last.startsWith('#') || last.startsWith('See ') || last.startsWith('  See '))
      break;
    lines.pop();
  }
  return lines.join('\n').trim();
}

/** Write CONTEXT.md */
export function persistContext(root, content) {
  const path = join(root, 'CONTEXT.md');
  writeFileSync(path, clean(content) + '\n');
  return path;
}
