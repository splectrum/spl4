/**
 * git/lib — shared internals for git operations.
 *
 * Thin wrapper around git CLI. Not a registered operation.
 */

import { execSync } from 'node:child_process';

/** Run a git command in the repo root. Returns stdout string. */
export function git(root, ...args) {
  return execSync(`git ${args.join(' ')}`, {
    cwd: root,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  }).trim();
}

/** Run git, return null on failure instead of throwing. */
export function gitSafe(root, ...args) {
  try {
    return git(root, ...args);
  } catch {
    return null;
  }
}
