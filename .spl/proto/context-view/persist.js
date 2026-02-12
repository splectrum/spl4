import { writeFileSync } from 'fs';
import { join } from 'path';

const CONTEXT_FILE = 'CONTEXT.md';

/** Clean haiccer output — strip preamble, code fences, trailing commentary */
function clean(content) {
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

/** Write the context description to CONTEXT.md */
export function persist(content) {
  const root = process.env.SPL_ROOT;
  const contextPath = join(root, CONTEXT_FILE);
  writeFileSync(contextPath, clean(content) + '\n');
  return contextPath;
}
