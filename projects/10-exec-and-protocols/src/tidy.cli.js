#!/usr/bin/env node
import { scan, clean } from './tidy.js';

const [, , command, path] = process.argv;

function help() {
  console.log(`tidy — transient artifact cleanup

Commands:
  scan [project]    Find transient artifacts (dry run)
  clean [project]   Remove transient artifacts

Path defaults to '.' (all projects).
Specify a project key (e.g. '08-dogfood') to target one.`);
}

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
        const name = f.split('/').pop();
        const status = project.cleaned.includes(f) ? ' (removed)' : '';
        lines.push(`    ${name}${status}`);
      }
    }
  }
  return lines.join('\n');
}

try {
  switch (command) {
    case 'scan': {
      const result = await scan(path || '.');
      console.log('Scan results:');
      console.log(formatResult(result));
      break;
    }
    case 'clean': {
      const result = await clean(path || '.');
      console.log('Clean results:');
      console.log(formatResult(result));
      break;
    }
    case 'help':
    case undefined:
      help();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      help();
      process.exit(1);
  }
} catch (err) {
  console.error(`tidy: ${err.message}`);
  process.exit(1);
}
