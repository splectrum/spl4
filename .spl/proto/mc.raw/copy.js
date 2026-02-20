/**
 * mc.raw/copy — copy a resource, git-aware.
 *
 * raw.copy(sourcePath, destParent, destKey)
 *
 * Reads source, creates at destination, stages with
 * git add. The copy is a new resource — its git history
 * starts from the copy point. Works through references
 * (source can be a reference, dest is always local).
 */

import { execSync } from 'node:child_process';

export default async function (execDoc) {
  const coreRead = await execDoc.resolve('mc.core/read');
  const coreCreate = await execDoc.resolve('mc.core/create');
  const root = execDoc.root;

  return async function (sourcePath, destParent, destKey) {
    // Read source content (works through references)
    const content = await coreRead(sourcePath);

    // Create at destination (copy-on-write handles refs)
    const location = await coreCreate(destParent, destKey, content);

    // Stage the new file
    const destRel = destParent === '/'
      ? destKey
      : destParent.slice(1) + '/' + destKey;

    execSync(`git add ${destRel}`, {
      cwd: root,
      encoding: 'utf-8',
    });

    return location;
  };
}
