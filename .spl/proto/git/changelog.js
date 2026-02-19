/**
 * git/changelog — reverse changelog as derived view.
 *
 * Usage: spl git changelog [path] [limit]
 *
 * Produces human-readable markdown changelog from git
 * history. Changes happen to resources directly, the
 * changelog extracts the story from git afterward.
 */

import { git } from './lib.js';

const SEP = '---commit---';
const FORMAT = `${SEP}%n%H%n%h%n%aN%n%aI%n%s`;

export default async function (execDoc) {
  const root = execDoc.root;

  return function (path, limit) {
    const mcPath = path ? execDoc.resolvePath(path) : '/';
    const fsPath = mcPath === '/' ? '.' : mcPath.slice(1);
    const n = limit ? parseInt(limit, 10) : 50;

    const args = ['log', `--format=${FORMAT}`, `-n`, `${n}`, '--', fsPath];
    const raw = git(root, ...args);
    if (!raw) return '# Changelog\n\nNo history.\n';

    const commits = raw.split(SEP)
      .filter(chunk => chunk.trim())
      .map(chunk => {
        const lines = chunk.trim().split('\n');
        return {
          short: lines[1],
          author: lines[2],
          date: lines[3],
          message: lines[4],
        };
      });

    const lines = [`# Changelog: ${fsPath}`, ''];

    for (const c of commits) {
      const date = c.date.slice(0, 10);
      lines.push(`- **${date}** ${c.message} (\`${c.short}\`, ${c.author})`);
    }

    lines.push('');
    return lines.join('\n');
  };
}
