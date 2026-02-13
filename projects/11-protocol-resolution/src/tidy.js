/**
 * tidy — transient artifact cleanup protocol.
 *
 * Registered at projects/ (container level).
 * Factory pattern: scan(execDoc) / clean(execDoc)
 * return bound operators.
 *
 * Dynamic imports via SPL_ROOT — sub-context protocols
 * can't use relative imports to reach root mc bundles.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SPL_ROOT;
function proto(path) {
  return pathToFileURL(join(root, path)).href;
}

const data = await import(proto('.spl/proto/mc.data/data.js'));
const core = await import(proto('.spl/proto/mc.core/core.js'));

const CONTEXT = '/projects';
const TRANSIENT = new Set([
  '.context-view', 'node_modules', 'dist', '.eval'
]);

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

/**
 * scan — factory. Returns operator(path).
 */
export function scan(execDoc) {
  return async function (path = '.') {
    execDoc.config = { mode: 'scan' };
    const targets = await resolveTargets(path);
    const projects = [];
    for (const target of targets) {
      projects.push(await tidySingle(target.path, 'scan'));
    }
    return { projects };
  };
}

/**
 * clean — factory. Returns operator(path).
 */
export function clean(execDoc) {
  return async function (path = '.') {
    execDoc.config = { mode: 'clean' };
    const targets = await resolveTargets(path);
    const projects = [];
    for (const target of targets) {
      projects.push(await tidySingle(target.path, 'clean'));
    }
    return { projects };
  };
}

/** Format result as human-readable text. */
export function formatResult(result) {
  const lines = [];
  for (const project of result.projects) {
    const key = project.projectRoot.split('/').pop();
    if (project.found.length === 0) {
      lines.push(`  ${key}: clean`);
    } else {
      const action = project.cleaned.length > 0 ? 'cleaned' : 'found';
      lines.push(`  ${key}: ${action} ${project.found.length} transient`);
      for (const f of project.found) {
        const status = project.cleaned.includes(f) ? ' (removed)' : '';
        lines.push(`    ${f.split('/').pop()}${status}`);
      }
    }
  }
  return lines.join('\n');
}
