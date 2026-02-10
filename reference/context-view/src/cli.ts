#!/usr/bin/env node

import { scan } from './scan.js';
import { render } from './render.js';
import { persist } from './persist.js';

const [,, command, ...args] = process.argv;

function help() {
  console.log(`context-view — repo context summary

Commands:
  show [path]     Print context summary to stdout
  sync [path]     Update CONTEXT.md (append immutable, regenerate mutable)
  help            Show this help`);
}

try {
  const from = args[0] || process.cwd();

  switch (command) {
    case 'show':
    case undefined: {
      const ctx = scan(from);
      console.log(render(ctx));
      break;
    }

    case 'sync': {
      const ctx = scan(from);
      const result = persist(ctx);
      if (result.added.length) {
        console.log(`Added: ${result.added.join(', ')}`);
      }
      console.log(`Updated: ${result.path}`);
      break;
    }

    case 'help':
      help();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      help();
      process.exit(1);
  }
} catch (err: any) {
  console.error(err.message);
  process.exit(1);
}
