/**
 * spl — protocol runner.
 *
 * Usage: spl <protocol> <operation> [path] [args...]
 *
 * Resolves protocol/operation via proto map.
 * Imports module, creates exec doc, calls factory
 * to get bound operator, invokes with args.
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SPL_ROOT;
if (!root) {
  console.error('spl: SPL_ROOT not set');
  process.exit(1);
}

const protoName = process.argv[2];
const operation = process.argv[3];

if (!protoName) {
  console.error('spl: usage: spl <protocol> <operation> [path] [args...]');
  process.exit(1);
}

if (!operation) {
  console.error('spl: operation required');
  process.exit(1);
}

function toURL(modulePath) {
  return pathToFileURL(join(root, modulePath)).href;
}

try {
  // Resolve via proto map
  const { ensure, resolve } = await import(
    new URL('proto/mc.proto/map.js', import.meta.url).href
  );
  const map = ensure();
  const key = `${protoName}/${operation}`;
  const reg = resolve(map, key);

  if (!reg) {
    throw new Error(`"${key}" not found`);
  }

  const { context, config } = reg;

  if (!config.module || !config.function) {
    throw new Error(`"${key}" missing module or function in config`);
  }

  // Import module, get factory
  const mod = await import(toURL(config.module));
  const factory = mod[config.function];
  if (typeof factory !== 'function') {
    throw new Error(`"${key}": ${config.function} is not a function`);
  }

  // Create exec doc
  const exec = await import(toURL('.spl/proto/mc.exec/exec.js'));
  const doc = exec.create(protoName, context);

  // Bind operator
  const operator = factory(doc);

  // Invoke with remaining args
  const args = process.argv.slice(4);
  const result = await operator(...args);

  // Complete
  doc.result = result;
  exec.complete(doc);

  // Output
  if (result !== undefined) {
    if (config.format) {
      const formatter = mod[config.format];
      if (typeof formatter === 'function') {
        console.log(formatter(result));
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  }
} catch (e) {
  console.error(`spl: ${e.message}`);
  process.exit(1);
}
