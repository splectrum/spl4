/**
 * tidy — transient artifact cleanup protocol.
 *
 * Registered at projects/ (container level).
 * State-changing — registers executions via mc.exec.
 *
 * Iterates project instances and runs tidySingle
 * on each. Each project instance is an independent
 * execution context with its own root.
 *
 * Dynamic imports via SPL_ROOT — sub-context protocols
 * can't use relative imports to reach root mc bundles.
 * Proper protocol resolution will replace this.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SPL_ROOT;
function proto(path) {
  return pathToFileURL(join(root, path)).href;
}

const data = await import(proto('.spl/proto/mc.data/data.js'));
const core = await import(proto('.spl/proto/mc.core/core.js'));
const exec = await import(proto('.spl/proto/mc.exec/exec.js'));

/** Context root for this protocol */
const CONTEXT = '/projects';

/** Patterns considered transient */
const TRANSIENT = new Set([
  '.context-view', 'node_modules', 'dist', '.eval'
]);

/**
 * tidySingle — scan/clean one project instance.
 *
 * Execution context root = projectRoot.
 * All mc calls prefixed with that root.
 */
async function tidySingle(projectRoot, mode) {
  const entries = await data.list(projectRoot);
  const found = entries
    .filter(e => TRANSIENT.has(e.path.split('/').pop()))
    .map(e => e.path);

  const cleaned = [];
  if (mode === 'clean') {
    for (const path of found) {
      await core.del(path);
      cleaned.push(path);
    }
  }

  return { projectRoot, found, cleaned };
}

/**
 * scan — find transient artifacts. Read-only report.
 *
 * path: project key (e.g. '08-dogfood'), or '.'
 * for all projects.
 */
export async function scan(path = '.') {
  const doc = exec.create('tidy', CONTEXT);
  doc.path = path;
  doc.config = { mode: 'scan' };

  try {
    const targets = await resolveTargets(path);
    doc.result = { projects: [] };

    for (const target of targets) {
      const result = await tidySingle(target.path, 'scan');
      doc.result.projects.push(result);
    }

    exec.complete(doc);
    return doc.result;
  } catch (e) {
    exec.fail(doc, e.message);
    throw e;
  }
}

/**
 * clean — remove transient artifacts.
 *
 * path: project key (e.g. '08-dogfood'), or '.'
 * for all projects.
 */
export async function clean(path = '.') {
  const doc = exec.create('tidy', CONTEXT);
  doc.path = path;
  doc.config = { mode: 'clean' };

  try {
    const targets = await resolveTargets(path);
    doc.result = { projects: [] };

    for (const target of targets) {
      const result = await tidySingle(target.path, 'clean');
      doc.result.projects.push(result);
    }

    exec.complete(doc);
    return doc.result;
  } catch (e) {
    exec.fail(doc, e.message);
    throw e;
  }
}

/**
 * Resolve target projects from path.
 * '.' = all projects. Otherwise, the project key.
 */
async function resolveTargets(path) {
  const entries = await data.list(CONTEXT);
  const projects = entries
    .filter(e => e.type === 'directory')
    .map(e => ({ key: e.path.split('/').pop(), path: e.path }));

  if (path === '.') return projects;

  const match = projects.filter(p => p.key === path);
  if (match.length === 0)
    throw new Error(`project not found: ${path}`);
  return match;
}
