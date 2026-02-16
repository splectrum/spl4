/**
 * tidy/lib — shared internals for tidy operations.
 */

export const CONTEXT = '/projects';
export const TRANSIENT = new Set([
  '.context-view', 'node_modules', 'dist', '.eval'
]);

export async function tidySingle(dataList, coreDel, projectRoot, mode) {
  const entries = await dataList(projectRoot);
  const found = entries
    .filter(e => TRANSIENT.has(e.path.split('/').pop()))
    .map(e => e.path);

  const cleaned = [];
  if (mode === 'clean') {
    for (const path of found) {
      await coreDel(path);
      cleaned.push(path);
    }
  }

  return { projectRoot, found, cleaned };
}

export async function resolveTargets(dataList, path) {
  const entries = await dataList(CONTEXT);
  const projects = entries
    .filter(e => e.type === 'directory')
    .map(e => ({ key: e.path.split('/').pop(), path: e.path }));

  if (path === '.') return projects;

  const match = projects.filter(p => p.key === path);
  if (match.length === 0)
    throw new Error(`project not found: ${path}`);
  return match;
}
