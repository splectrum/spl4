/**
 * test/run — run test suites.
 *
 * Loads all suites from the suites/ directory,
 * runs them against a real exec doc, reports results.
 *
 * Usage: spl test run [suite-name]
 *   No args = run all suites.
 *   With arg = run only that suite.
 */

import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { buildTestDoc, runSuite } from './lib.js';

export default async function (execDoc) {
  const doc = await buildTestDoc(execDoc.root, execDoc.map);

  return async function (suiteName) {
    const suitesDir = join(execDoc.root, '.spl/proto/test/suites');
    const files = readdirSync(suitesDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    const allResults = [];

    for (const file of files) {
      const mod = await import(pathToFileURL(join(suitesDir, file)).href);
      if (suiteName && mod.name !== suiteName) continue;

      console.log(`Suite: ${mod.name}`);
      const results = await runSuite(mod.name, mod.tests, doc);

      for (const r of results) {
        const icon = r.pass ? 'PASS' : 'FAIL';
        console.log(`  ${icon}  ${r.test}`);
        if (!r.pass && r.error) {
          console.log(`         ${r.error}`);
        }
      }

      allResults.push(...results);
    }

    const passed = allResults.filter(r => r.pass).length;
    const failed = allResults.filter(r => !r.pass).length;
    const total = allResults.length;

    console.log(`\n${passed}/${total} passed, ${failed} failed`);

    return { passed, failed, total, results: allResults };
  };
}
