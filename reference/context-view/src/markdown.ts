/** Extract section from markdown by ## heading (includes ### sub-headings) */
export function extractSection(md: string, heading: string): string | null {
  const lines = md.split('\n');
  let capturing = false;
  const result: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      if (capturing) break;
      if (line.toLowerCase().includes(heading.toLowerCase())) {
        capturing = true;
        continue;
      }
    }
    if (capturing) result.push(line);
  }

  const text = result.join('\n').trim();
  return text || null;
}
