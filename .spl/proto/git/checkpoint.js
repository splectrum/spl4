/**
 * git/checkpoint — stage, commit, push in one operation.
 *
 * Usage: spl git checkpoint <path> <message>
 *
 * Stages all changes under path, commits with message,
 * pushes to remote. A checkpoint is a rollback point.
 */

import { git } from './lib.js';

export default async function (execDoc) {
  const root = execDoc.root;

  return function (path, message) {
    if (!path) throw new Error('path required');
    if (!message) throw new Error('message required');

    // Resolve to filesystem path relative to repo root
    const mcPath = execDoc.resolvePath(path);
    const fsPath = mcPath === '/' ? '.' : mcPath.slice(1);

    // Stage
    git(root, 'add', fsPath);

    // Commit
    git(root, 'commit', '-m', JSON.stringify(message));

    // Push
    git(root, 'push');

    // Return the commit info
    const hash = git(root, 'rev-parse', '--short', 'HEAD');
    const fullHash = git(root, 'rev-parse', 'HEAD');

    return {
      checkpoint: hash,
      hash: fullHash,
      path: fsPath,
      message,
    };
  };
}
