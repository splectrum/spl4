/**
 * git/status — file status for a path.
 *
 * Usage: spl git status [path]
 *
 * Returns structured status: staged, unstaged, untracked
 * files with their status codes. Path optional — defaults
 * to repo root.
 */

import { git } from './lib.js';

export default async function (execDoc) {
  const root = execDoc.root;

  return function (path) {
    const mcPath = path ? execDoc.resolvePath(path) : '/';
    const fsPath = mcPath === '/' ? '.' : mcPath.slice(1);

    const raw = git(root, 'status', '--porcelain', '--', fsPath);
    if (!raw) return { files: [], clean: true };

    const files = raw.split('\n').map(line => {
      const staged = line[0];
      const unstaged = line[1];
      const file = line.slice(3);
      return { file, staged, unstaged };
    });

    return { files, clean: false };
  };
}
