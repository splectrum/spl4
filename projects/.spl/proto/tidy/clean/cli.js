#!/usr/bin/env node
import { clean } from '../../projects/.spl/proto/tidy/tidy.js';

const path = process.argv[2] || '.';

function formatResult(result) {
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

try {
  const result = await clean(path);
  console.log('Clean results:');
  console.log(formatResult(result));
} catch (err) {
  console.error(`tidy clean: ${err.message}`);
  process.exit(1);
}
