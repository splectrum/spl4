#!/usr/bin/env node
import { scan } from '../../projects/.spl/proto/tidy/tidy.js';

const path = process.argv[2] || '.';

function formatResult(result) {
  const lines = [];
  for (const project of result.projects) {
    const key = project.projectRoot.split('/').pop();
    if (project.found.length === 0) {
      lines.push(`  ${key}: clean`);
    } else {
      lines.push(`  ${key}: found ${project.found.length} transient`);
      for (const f of project.found) {
        lines.push(`    ${f.split('/').pop()}`);
      }
    }
  }
  return lines.join('\n');
}

try {
  const result = await scan(path);
  console.log('Scan results:');
  console.log(formatResult(result));
} catch (err) {
  console.error(`tidy scan: ${err.message}`);
  process.exit(1);
}
