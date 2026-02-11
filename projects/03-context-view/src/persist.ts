import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONTEXT_FILE = 'CONTEXT.md';

/** Clean haiccer output — strip preamble, code fences, trailing commentary */
function clean(content: string): string {
  let text = content;
  // Strip anything before # Context
  const idx = text.indexOf('# Context');
  if (idx > 0) text = text.slice(idx);
  // Strip code fences
  text = text.replace(/^```\w*\n?/gm, '').replace(/\n?```\s*$/g, '');
  // Strip trailing commentary — keep only lines that are headings,
  // content under headings, references, or blank
  const lines = text.trim().split('\n');
  while (lines.length > 0) {
    const last = lines[lines.length - 1].trim();
    if (last === '' || last.startsWith('#') || last.startsWith('See ') || last.startsWith('  See ')) break;
    lines.pop();
  }
  return lines.join('\n').trim();
}

/** Write the context description to CONTEXT.md */
export function persist(root: string, content: string): string {
  const contextPath = join(root, CONTEXT_FILE);
  writeFileSync(contextPath, clean(content) + '\n');
  return contextPath;
}
