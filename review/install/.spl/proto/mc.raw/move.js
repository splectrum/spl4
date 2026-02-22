/**
 * mc.raw/move — move a resource, git-aware.
 *
 * raw.move(sourcePath, destParent, destKey)
 *
 * Uses git mv so history follows the file. Only moves
 * local resources — rejects reference-only sources.
 * Stages the change for git/checkpoint.
 */

import { execSync } from 'node:child_process';

export default async function (execDoc) {
  const xpathResolve = await execDoc.resolve('mc.xpath/resolve');
  const root = execDoc.root;

  return async function (sourcePath, destParent, destKey) {
    // Resolve source
    const source = await xpathResolve(sourcePath);
    if (source.source === 'reference') {
      throw new Error(`mc.raw.move: cannot move reference: ${sourcePath}`);
    }
    if (source.type !== 'file') {
      throw new Error(`mc.raw.move: source must be a file: ${sourcePath}`);
    }

    // Resolve destination parent
    const parent = await xpathResolve(destParent);
    if (parent.type !== 'directory') {
      throw new Error(`mc.raw.move: destination not a directory: ${destParent}`);
    }

    // Build filesystem paths relative to repo root
    const srcRel = sourcePath.startsWith('/') ? sourcePath.slice(1) : sourcePath;
    const destRel = destParent === '/'
      ? destKey
      : destParent.slice(1) + '/' + destKey;

    // Ensure source is tracked (git mv requires it)
    try {
      execSync(`git ls-files --error-unmatch ${srcRel}`, {
        cwd: root, encoding: 'utf-8', stdio: 'pipe',
      });
    } catch {
      // Untracked — stage it first
      execSync(`git add ${srcRel}`, { cwd: root, encoding: 'utf-8' });
    }

    // git mv — preserves history
    execSync(`git mv ${srcRel} ${destRel}`, {
      cwd: root,
      encoding: 'utf-8',
    });

    // Return the new location
    const newPath = destParent === '/'
      ? '/' + destKey
      : destParent + '/' + destKey;
    return xpathResolve(newPath);
  };
}
