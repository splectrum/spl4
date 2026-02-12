/**
 * spl — bootstrap chain.
 *
 * Boot mc.proto (one-time) → proper mc.proto (via mc.core)
 * → resolve mc.xpath → verify root → resolve protocol → invoke.
 *
 * Sets SPL_ROOT from git. All protocols read it from env.
 */

import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SPL_ROOT;
if (!root) {
  console.error('spl: SPL_ROOT not set');
  process.exit(1);
}

const protoName = process.argv[2];
if (!protoName) {
  console.error('spl: protocol name required');
  process.exit(1);
}

function toURL(modulePath) {
  return pathToFileURL(join(root, modulePath)).href;
}

try {
  // Boot mc.proto (known location — the one direct import)
  const boot = await import(toURL('.spl/proto/mc.proto/boot.js'));

  // Boot → resolve proper mc.proto (uses mc.core → mc.xpath)
  const protoConfig = boot.resolve('mc.proto');
  const proto = await import(toURL(protoConfig.module));

  // Proper mc.proto → resolve mc.xpath
  const xpathConfig = await proto.resolve('mc.xpath');
  const xpath = await import(toURL(xpathConfig.module));

  // Verify root is a mycelium context
  const rootLocation = await xpath.resolve('/');
  if (!rootLocation.isContext) {
    console.error('spl: root is not a mycelium context');
    process.exit(1);
  }

  // Resolve requested protocol through proper mc.proto
  const config = await proto.resolve(protoName);
  if (!config.run) {
    console.error(`spl: protocol "${protoName}" has no run command`);
    process.exit(1);
  }

  // Invoke
  const args = process.argv.slice(3);
  const cmd = args.length > 0
    ? `${config.run} ${args.join(' ')}`
    : config.run;

  execSync(cmd, { cwd: root, stdio: 'inherit' });
} catch (e) {
  console.error(`spl: ${e.message}`);
  process.exit(1);
}
