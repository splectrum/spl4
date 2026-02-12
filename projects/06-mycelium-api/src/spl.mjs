/**
 * spl — bootstrap chain.
 *
 * Boot mc.proto → resolve mc.xpath → verify root →
 * resolve requested protocol → invoke.
 *
 * Receives SPL_ROOT from environment (set by spl wrapper).
 */

import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SPL_ROOT;
if (!root) {
  console.error('spl: SPL_ROOT not set');
  process.exit(1);
}

const proto = process.argv[2];
if (!proto) {
  console.error('spl: protocol name required');
  process.exit(1);
}

try {
  // Boot mc.proto (known location — the one direct import)
  const boot = await import(
    pathToFileURL(join(root, '.spl/proto/mc.proto/boot.js')).href
  );

  // Resolve mc.xpath through boot mc.proto
  const xpathConfig = boot.resolve(root, 'mc.xpath');
  const xpath = await import(
    pathToFileURL(join(root, xpathConfig.module)).href
  );

  // Verify root is a mycelium context
  const rootLocation = await xpath.resolve(root, '/');
  if (!rootLocation.isContext) {
    console.error('spl: root is not a mycelium context');
    process.exit(1);
  }

  // Resolve requested protocol
  const config = boot.resolve(root, proto);
  if (!config.run) {
    console.error(`spl: protocol "${proto}" has no run command`);
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
