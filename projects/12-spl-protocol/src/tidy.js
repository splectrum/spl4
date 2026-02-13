/**
 * tidy — transient artifact cleanup protocol.
 *
 * Registered at projects/ (container level).
 * Factory pattern: scan(execDoc) / clean(execDoc)
 * return bound operators.
 *
 * Async factory — imports mc modules using execDoc.root.
 * No env var dependency.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const CONTEXT = '/projects';
const TRANSIENT = new Set([
  '.context-view', 'node_modules', 'dist', '.eval'
]);

async function loadDeps(execDoc) {
  const proto = p => pathToFileURL(join(execDoc.root, p)).href;
  const data = await import(proto('.spl/proto/mc.data/data.js'));
  const core = await import(proto('.spl/proto/mc.core/core.js'));
  return { data, core };
}

async function tidySingle(data, core, projectRoot, mode) {
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

async function resolveTargets(data, path) {
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
 * scan — async factory. Returns operator(path).
 */
export async function scan(execDoc) {
  const { data, core } = await loadDeps(execDoc);

  return async function (path = '.') {
    execDoc.config = { mode: 'scan' };
    const targets = await resolveTargets(data, path);
    const projects = [];
    for (const target of targets) {
      projects.push(await tidySingle(data, core, target.path, 'scan'));
    }
    return { projects };
  };
}

/**
 * clean — async factory. Returns operator(path).
 */
export async function clean(execDoc) {
  const { data, core } = await loadDeps(execDoc);

  return async function (path = '.') {
    execDoc.config = { mode: 'clean' };
    const targets = await resolveTargets(data, path);
    const projects = [];
    for (const target of targets) {
      projects.push(await tidySingle(data, core, target.path, 'clean'));
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
