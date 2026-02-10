/**
 * Folder-based storage capability.
 * context = directory, file record = file.
 */

import { readdir, stat, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { StorageCapability, Context, FlatRecord, Record } from './types.js';

const IGNORE = new Set([
  'node_modules', '.git', 'dist', '.mycelium',
]);

function ignored(name: string): boolean {
  return name.startsWith('.') && name !== '.' || IGNORE.has(name);
}

export class FolderStorage implements StorageCapability {
  constructor(private root: string) {}

  async readContext(path: string): Promise<Context> {
    const abs = join(this.root, path);
    const entries = await readdir(abs, { withFileTypes: true });
    const records: Record[] = [];

    for (const e of entries) {
      if (ignored(e.name)) continue;
      const full = join(abs, e.name);
      if (e.isDirectory()) {
        const children = (await readdir(full)).filter(n => !ignored(n));
        records.push({ key: e.name, type: 'context', size: children.length });
      } else if (e.isFile()) {
        const s = await stat(full);
        records.push({ key: e.name, type: 'file', size: s.size });
      }
    }

    return { path, records };
  }

  async readRecord(path: string): Promise<Buffer> {
    return readFile(join(this.root, path));
  }

  async flatten(path: string): Promise<FlatRecord[]> {
    const result: FlatRecord[] = [];
    const base = join(this.root, path);

    async function walk(dir: string) {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        if (ignored(e.name)) continue;
        const full = join(dir, e.name);
        if (e.isDirectory()) {
          await walk(full);
        } else if (e.isFile()) {
          const s = await stat(full);
          result.push({ key: relative(base, full), size: s.size });
        }
      }
    }

    await walk(base);
    return result.sort((a, b) => a.key.localeCompare(b.key));
  }

  async createRecord(path: string, content?: Buffer): Promise<void> {
    const abs = join(this.root, path);
    if (content !== undefined) {
      await writeFile(abs, content);
    } else {
      await mkdir(abs, { recursive: true });
    }
  }

  async writeRecord(path: string, content: Buffer): Promise<void> {
    await writeFile(join(this.root, path), content);
  }

  async deleteRecord(path: string): Promise<void> {
    await rm(join(this.root, path), { recursive: true, force: true });
  }
}
