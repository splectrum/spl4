/**
 * General pattern compliance tests.
 *
 * Verifies P1 (Uniform Factory), P2 (Config as Indirection),
 * P7 (Resolution Through Map) across all registered operations.
 */

import { scanConfigs, checkDefaultExport } from '../lib.js';

export const name = 'general';

export const tests = {
  /** P2: All configs contain only module path */
  async 'P2: config contains only module'(doc, assert) {
    const issues = scanConfigs(doc.root, doc.map);
    assert.equal(issues.length, 0,
      `Config violations:\n${issues.map(i => `  ${i.key}: ${i.issue}`).join('\n')}`);
  },

  /** P1: All modules have default export function */
  async 'P1: all modules have default export'(doc, assert) {
    const failures = [];
    for (const [key, regs] of Object.entries(doc.map)) {
      for (const reg of regs) {
        const result = await checkDefaultExport(doc.root, reg.config.module);
        if (!result.pass) {
          failures.push(`${key}: ${result.error}`);
        }
      }
    }
    assert.equal(failures.length, 0,
      `Default export violations:\n${failures.map(f => `  ${f}`).join('\n')}`);
  },

  /** P7: All operations resolvable through map */
  async 'P7: all operations resolvable'(doc, assert) {
    const keys = Object.keys(doc.map);
    assert.ok(keys.length > 0, 'map is empty');
    for (const key of keys) {
      const regs = doc.map[key];
      assert.ok(regs && regs.length > 0, `${key}: no registrations`);
    }
  },

  /** P1: Factory returns function when called with doc */
  async 'P1: factories return operators'(doc, assert) {
    // Test a sample of operations across the stack
    const samples = ['mc.xpath/resolve', 'mc.core/list', 'mc.data/read', 'mc.raw/read'];
    for (const key of samples) {
      const operator = await doc.resolve(key);
      assert.type(operator, 'function', `${key}: operator is not a function`);
    }
  },
};
