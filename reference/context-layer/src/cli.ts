#!/usr/bin/env node

/**
 * Mycelium CLI — flat API with context traversal.
 *
 * Usage:
 *   mycelium [options] <command> [args]
 *
 * Options:
 *   --store folder|file         Select storage (default: folder)
 *   --file <path>               JSON file for file-based storage
 *   --meta <path>=<key>:<value> Context metadata (repeatable)
 *
 * Commands:
 *   ls <path>                   List context contents
 *   read <path>                 Read record content
 *   flat <path>                 Flatten context recursively
 *   create <path> [content]     Create record
 *     --stdin                   Read content from stdin
 *   write <path> <content>      Overwrite record
 *     --stdin                   Read content from stdin
 *   delete <path>               Delete record
 *   move <from> <to>            Relocate record
 *   log <path>                  Show changelog (record or context)
 *   help                        Show this help
 */

import type { StorageCapability, ContextDefs } from './types.js';
import { FolderStorage } from './folder.js';
import { FileStorage } from './file.js';
import { ContextCapability } from './context.js';
import { readLog, readContextLog } from './changelog.js';
import { resolve } from 'node:path';

function parseArgs(argv: string[]) {
  let store = 'folder';
  let file = 'mycelium.json';
  const metaArgs: string[] = [];
  const rest: string[] = [];
  let stdin = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--store' && argv[i + 1]) {
      store = argv[++i];
    } else if (argv[i] === '--file' && argv[i + 1]) {
      file = argv[++i];
    } else if (argv[i] === '--meta' && argv[i + 1]) {
      metaArgs.push(argv[++i]);
    } else if (argv[i] === '--stdin') {
      stdin = true;
    } else {
      rest.push(argv[i]);
    }
  }

  return { store, file, metaArgs, stdin, command: rest[0], args: rest.slice(1) };
}

function parseDefs(metaArgs: string[]): ContextDefs {
  const defs: ContextDefs = {};
  for (const arg of metaArgs) {
    // Format: path=key:value
    const eqIdx = arg.indexOf('=');
    if (eqIdx === -1) continue;
    const path = arg.slice(0, eqIdx);
    const kvPart = arg.slice(eqIdx + 1);
    const colonIdx = kvPart.indexOf(':');
    if (colonIdx === -1) continue;
    const key = kvPart.slice(0, colonIdx);
    const value = kvPart.slice(colonIdx + 1);

    if (!defs[path]) defs[path] = {};
    defs[path][key] = value;
  }
  return defs;
}

function makeStorage(store: string, file: string): StorageCapability {
  if (store === 'file') {
    return new FileStorage(resolve(file));
  }
  return new FolderStorage(resolve('.'));
}

function formatSize(size: number, type: string): string {
  if (type === 'context') return `${size} items`;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function readStdin(): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function main() {
  const { store, file, metaArgs, stdin, command, args } = parseArgs(process.argv.slice(2));
  const storage = makeStorage(store, file);
  const defs = parseDefs(metaArgs);
  const cap = new ContextCapability(storage, defs);

  switch (command) {
    case 'ls': {
      const path = args[0] || '.';
      const ctx = await cap.list(path);
      for (const r of ctx.records) {
        const suffix = r.type === 'context' ? '/' : '';
        console.log(`${r.key}${suffix}  (${formatSize(r.size, r.type)})`);
      }
      break;
    }

    case 'read': {
      if (!args[0]) { console.error('Usage: mycelium read <path>'); process.exit(1); }
      const buf = await cap.read(args[0]);
      process.stdout.write(buf);
      break;
    }

    case 'flat': {
      const path = args[0] || '.';
      const records = await cap.flatten(path);
      for (const r of records) {
        console.log(`${r.key}  (${formatSize(r.size, 'file')})`);
      }
      break;
    }

    case 'create': {
      if (!args[0]) { console.error('Usage: mycelium create <path> [content]'); process.exit(1); }
      let content: Buffer | undefined;
      if (stdin) {
        content = await readStdin();
      } else if (args[1]) {
        content = Buffer.from(args.slice(1).join(' '));
      }
      await cap.create(args[0], content);
      console.log(content !== undefined ? `Created file: ${args[0]}` : `Created context: ${args[0]}`);
      break;
    }

    case 'write': {
      if (!args[0]) { console.error('Usage: mycelium write <path> <content>'); process.exit(1); }
      let content: Buffer;
      if (stdin) {
        content = await readStdin();
      } else if (args[1]) {
        content = Buffer.from(args.slice(1).join(' '));
      } else {
        console.error('Usage: mycelium write <path> <content>');
        process.exit(1);
      }
      await cap.write(args[0], content);
      console.log(`Written: ${args[0]}`);
      break;
    }

    case 'delete': {
      if (!args[0]) { console.error('Usage: mycelium delete <path>'); process.exit(1); }
      await cap.delete(args[0]);
      console.log(`Deleted: ${args[0]}`);
      break;
    }

    case 'move': {
      if (!args[0] || !args[1]) { console.error('Usage: mycelium move <from> <to>'); process.exit(1); }
      await cap.move(args[0], args[1]);
      console.log(`Moved: ${args[0]} → ${args[1]}`);
      break;
    }

    case 'log': {
      if (!args[0]) { console.error('Usage: mycelium log <path>'); process.exit(1); }
      try {
        const entries = await readLog(storage, args[0]);
        for (const e of entries) {
          console.log(`${e.timestamp}\t${e.operation}\t${e.fingerprint}`);
        }
      } catch {
        const entries = await readContextLog(storage, args[0]);
        for (const e of entries) {
          console.log(`${e.timestamp}\t${e.key}\t${e.operation}\t${e.fingerprint}`);
        }
      }
      break;
    }

    case 'help':
    default:
      console.log(`Mycelium — flat API with context traversal

Usage: mycelium [options] <command> [args]

Options:
  --store folder|file         Select storage (default: folder)
  --file <path>               JSON file for file-based storage
  --meta <path>=<key>:<value> Context metadata (repeatable)

Metadata keys:
  mutable   true|false  (default: true)
  mode      none|log-first|resource-first  (default: none)
  flat      true|false  (default: false)

Commands:
  ls <path>                   List context contents
  read <path>                 Read record content
  flat <path>                 Flatten context recursively
  create <path> [content]     Create record
    --stdin                   Read content from stdin
  write <path> <content>      Overwrite record
    --stdin                   Read content from stdin
  delete <path>               Delete record (and its changelog)
  move <from> <to>            Relocate record (with changelog)
  log <path>                  Show changelog (record or context)
  help                        Show this help`);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
