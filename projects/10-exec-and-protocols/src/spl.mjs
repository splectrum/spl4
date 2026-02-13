/**
 * spl — bootstrap chain.
 *
 * Boot mc.proto (one-time) → proper mc.proto (via mc.core)
 * → resolve mc.xpath → verify root → resolve protocol → invoke.
 *
 * Supports named resolution (spl stats) and fully qualified
 * paths (spl projects/.spl/proto/tidy). Detection: presence
 * of '/' in the protocol argument.
 *
 * Sets SPL_ROOT from git. All protocols read it from env.
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
if (!protoName) {
  console.error('spl: protocol name required');
  process.exit(1);
}

function toURL(modulePath) {
  return pathToFileURL(join(root, modulePath)).href;
}

/**
 * Resolve protocol config by fully qualified path.
 * The path points to a protocol directory containing
 * config.json. No bootstrap needed — direct read.
 */
function resolveQualified(protoPath) {
  const configPath = join(root, protoPath, 'config.json');
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (e) {
    throw new Error(`cannot resolve "${protoPath}" — ${e.message}`);
  }
}

try {
  let config;

  if (protoName.includes('/')) {
    // Fully qualified — direct resolution
    config = resolveQualified(protoName);
  } else {
    // Named — bootstrap and resolve via mc.proto
    const boot = await import(toURL('.spl/proto/mc.proto/boot.js'));
    const protoConfig = boot.resolve('mc.proto');
    const proto = await import(toURL(protoConfig.module));

    const xpathConfig = await proto.resolve('mc.xpath');
    const xpath = await import(toURL(xpathConfig.module));

    const rootLocation = await xpath.resolve('/');
    if (!rootLocation.isContext) {
      console.error('spl: root is not a mycelium context');
      process.exit(1);
    }

    config = await proto.resolve(protoName);
  }

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
