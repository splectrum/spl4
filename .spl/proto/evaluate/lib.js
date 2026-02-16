/**
 * evaluate/lib — shared internals for evaluation operations.
 */

export const EVAL_DIR = '.eval';
export const SKIP_DIRS = new Set(['node_modules', '.git', '.eval', 'dist', '.spl', '.context-view']);

export function evalPath(projectPath, ...parts) {
  return projectPath + '/' + EVAL_DIR + (parts.length ? '/' + parts.join('/') : '');
}

export async function mcExists(rawRead, path) {
  try {
    await rawRead(path, 'utf-8');
    return true;
  } catch { return false; }
}
