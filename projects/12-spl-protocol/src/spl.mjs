/**
 * spl — protocol runner.
 *
 * Usage: spl <protocol> <operation> [path] [args...]
 *
 * spl/boot is the entry point — the one hardcoded
 * operation. It can't resolve itself via a map that
 * doesn't exist yet.
 *
 * Boot sequence:
 *   1. Read SPL_ROOT from env (the one seam)
 *   2. Import mc.proto/map.js (module cache persists it)
 *   3. Ensure proto map (load or build)
 *   4. Import mc.exec (module cache)
 *   5. Create exec doc (root enumerable, map non-enumerable)
 *   6. faf start drop
 *   7. Resolve protocol/operation
 *   8. Import module, call factory(doc), get operator
 *   9. Invoke operator with args
 *  10. faf complete drop
 *  11. Format output
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Step 1: SPL_ROOT — read once, never again
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
  // Step 2-3: Boot — load map module, ensure map
  const mapModule = await import(
    new URL('proto/mc.proto/map.js', import.meta.url).href
  );
  const map = mapModule.ensure(root);

  // Step 4: Load exec module
  const exec = await import(toURL('.spl/proto/mc.exec/exec.js'));

  // Step 7: Resolve protocol/operation
  const key = `${protoName}/${operation}`;
  const reg = mapModule.resolve(key);

  if (!reg) {
    throw new Error(`"${key}" not found`);
  }

  const { context, config } = reg;

  if (!config.module || !config.function) {
    throw new Error(`"${key}" missing module or function in config`);
  }

  // Step 5-6: Create exec doc with faf start
  const doc = exec.create(protoName, context, root);

  // Attach map as non-enumerable (invisible to faf)
  Object.defineProperty(doc, 'map', {
    value: map,
    enumerable: false
  });

  // Step 8: Import module, get factory, bind operator
  const mod = await import(toURL(config.module));
  const factory = mod[config.function];
  if (typeof factory !== 'function') {
    throw new Error(`"${key}": ${config.function} is not a function`);
  }

  const operator = await factory(doc);

  // Step 9: Invoke with remaining args
  const args = process.argv.slice(4);
  const result = await operator(...args);

  // Step 10: Complete
  doc.result = result;
  exec.complete(doc);

  // Step 11: Output
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
