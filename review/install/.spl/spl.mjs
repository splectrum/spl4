/**
 * spl — protocol runner.
 *
 * Usage: spl <protocol> <operation> [path] [args...]
 *
 * Receives a seed doc (JSON) as first argument from the
 * wrapper. The seed contains root and raw argv. spl.mjs
 * reads everything from the seed — no env vars.
 *
 * Boot sequence:
 *   1. Parse seed doc (root + argv)
 *   2. Import mc.proto/map.js (module cache persists it)
 *   3. Ensure proto map (load or build)
 *   4. Import mc.exec/create + complete (seed as factory input)
 *   5. Create exec doc
 *   6. faf start drop
 *   7. Resolve protocol/operation
 *   8. Import module, call default export factory(doc), get operator
 *   9. Capture stdout/stderr
 *  10. Invoke operator with args
 *  11. Stop capture, persist output
 *  12. faf complete drop
 *  13. Output result as JSON
 */

import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

// Step 1: Parse seed doc
const seed = JSON.parse(process.argv[2]);
const root = seed.root;
const protoName = seed.argv[0];
const operation = seed.argv[1];
const args = seed.argv.slice(2);

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

  // Step 4: Load exec operations (seed as factory input)
  const execCreateMod = await import(toURL('.spl/proto/mc.exec/create.js'));
  const execCreate = await execCreateMod.default(seed);
  const execCompleteMod = await import(toURL('.spl/proto/mc.exec/complete.js'));
  const execComplete = await execCompleteMod.default(seed);

  // Step 7: Resolve protocol/operation
  const key = `${protoName}/${operation}`;
  const reg = mapModule.resolve(key);

  if (!reg) {
    throw new Error(`"${key}" not found`);
  }

  const { context, config } = reg;

  if (!config.module) {
    throw new Error(`"${key}" missing module in config`);
  }

  // Step 5-6: Create exec doc with faf start
  const doc = execCreate(protoName, context);

  // Attach map as non-enumerable (invisible to faf)
  Object.defineProperty(doc, 'map', {
    value: map,
    enumerable: false
  });

  // POV — CWD relative to root
  const prefix = relative(root, process.cwd()) || '.';
  Object.defineProperty(doc, 'prefix', {
    value: prefix,
    enumerable: false
  });

  // Resolve resource path: CWD-relative -> absolute mc path.
  // Resources are relative to POV, can't escape above it.
  // Functionality (modules, proto map) is root-relative.
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

  // mc.proto/resolve — bootstrap from map, bind to doc
  const resolveMod = await import(toURL('.spl/proto/mc.proto/resolve.js'));
  const resolve = await resolveMod.default(doc);
  Object.defineProperty(doc, 'resolve', {
    value: resolve,
    enumerable: false
  });

  // Step 8: Import module, get default export factory, bind operator
  const mod = await import(toURL(config.module));
  const factory = mod.default;
  if (typeof factory !== 'function') {
    throw new Error(`"${key}": default export is not a function`);
  }

  const operator = await factory(doc);

  // Step 9: Capture stdout/stderr
  const captured = { stdout: [], stderr: [] };
  const origStdoutWrite = process.stdout.write.bind(process.stdout);
  const origStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = function (chunk, encoding, callback) {
    captured.stdout.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return origStdoutWrite(chunk, encoding, callback);
  };

  process.stderr.write = function (chunk, encoding, callback) {
    captured.stderr.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return origStderrWrite(chunk, encoding, callback);
  };

  // Step 10: Invoke with remaining args
  const result = await operator(...args);

  // Step 11: Stop capture
  process.stdout.write = origStdoutWrite;
  process.stderr.write = origStderrWrite;

  // Persist captured output on exec doc
  const stdout = captured.stdout.join('');
  const stderr = captured.stderr.join('');
  if (stdout) doc.stdout = stdout;
  if (stderr) doc.stderr = stderr;

  // Step 12: Complete
  doc.result = result;
  execComplete(doc);

  // Step 13: Output
  if (result !== undefined) {
    console.log(JSON.stringify(result, null, 2));
  }
} catch (e) {
  console.error(`spl: ${e.message}`);
  process.exit(1);
}
