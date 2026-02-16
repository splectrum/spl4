/**
 * test/lib — harness utilities.
 *
 * Builds exec docs for testing, runs suites, collects results.
 */

import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

/**
 * Build a test exec doc with real resolve capability.
 * Uses the proto map to wire up resolve — same as boot
 * but without CLI, capture, or faf.
 */
export async function buildTestDoc(root, map) {
  const doc = { root };

  const prefix = relative(root, process.cwd()) || '.';

  Object.defineProperty(doc, 'map', { value: map, enumerable: false });
  Object.defineProperty(doc, 'prefix', { value: prefix, enumerable: false });

  Object.defineProperty(doc, 'resolvePath', {
    value: function (path) {
      const resolved = join(prefix, path);
      if (resolved.startsWith('..') || (!resolved.startsWith(prefix) && prefix !== '.')) {
        throw new Error(`path escapes context: ${path}`);
      }
      return '/' + resolved;
    },
    enumerable: false
  });

  // Bootstrap mc.proto/resolve — same as boot
  const resolveMod = await import(pathToFileURL(join(root, '.spl/proto/mc.proto/resolve.js')).href);
  const resolve = await resolveMod.default(doc);
  Object.defineProperty(doc, 'resolve', {
    value: resolve,
    enumerable: false
  });

  return doc;
}

/**
 * Run a suite of tests. A suite is an object of
 * { name: asyncFunction } pairs. Each function receives
 * the test doc and an assert helper.
 *
 * Returns: [{ name, pass, error? }]
 */
export async function runSuite(name, tests, doc) {
  const results = [];
  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      await testFn(doc, assert);
      results.push({ suite: name, test: testName, pass: true });
    } catch (e) {
      results.push({ suite: name, test: testName, pass: false, error: e.message });
    }
  }
  return results;
}

/**
 * Simple assertion helpers. Throw on failure.
 */
export const assert = {
  ok(value, msg) {
    if (!value) throw new Error(msg || `expected truthy, got ${value}`);
  },
  equal(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  },
  deepEqual(actual, expected, msg) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(msg || `deep equal failed:\n  actual: ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`);
    }
  },
  throws(fn, msg) {
    let threw = false;
    try { fn(); } catch { threw = true; }
    if (!threw) throw new Error(msg || 'expected function to throw');
  },
  async rejects(fn, msg) {
    let threw = false;
    try { await fn(); } catch { threw = true; }
    if (!threw) throw new Error(msg || 'expected async function to reject');
  },
  type(value, expected, msg) {
    if (typeof value !== expected) {
      throw new Error(msg || `expected type ${expected}, got ${typeof value}`);
    }
  }
};

/**
 * Scan config.json files in the proto map for pattern compliance.
 */
export function scanConfigs(root, map) {
  const issues = [];
  for (const [key, regs] of Object.entries(map)) {
    for (const reg of regs) {
      const cfg = reg.config;
      const extraKeys = Object.keys(cfg).filter(k => k !== 'module');
      if (extraKeys.length > 0) {
        issues.push({ key, issue: `extra config keys: ${extraKeys.join(', ')}` });
      }
      if (!cfg.module) {
        issues.push({ key, issue: 'missing module in config' });
      }
    }
  }
  return issues;
}

/**
 * Check that a module has a default export that is a function.
 */
export async function checkDefaultExport(root, modulePath) {
  const mod = await import(pathToFileURL(join(root, modulePath)).href);
  if (typeof mod.default !== 'function') {
    return { pass: false, error: `default export is ${typeof mod.default}, not function` };
  }
  return { pass: true };
}
