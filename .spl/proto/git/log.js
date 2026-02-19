/**
 * git/log — commit history for a path.
 *
 * Usage: spl git log [path] [limit]
 *
 * Returns structured commit data scoped to a path.
 * Substrate for git/changelog.
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
    if (!raw) return [];

    return raw.split(SEP)
      .filter(chunk => chunk.trim())
      .map(chunk => {
        const lines = chunk.trim().split('\n');
        return {
          hash: lines[0],
          short: lines[1],
          author: lines[2],
          date: lines[3],
          message: lines[4],
        };
      });
  };
}
