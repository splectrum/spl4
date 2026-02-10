/**
 * File-based storage capability.
 * Everything in a single JSON file.
 */

import { readFile, writeFile } from 'node:fs/promises';
import type { StorageCapability, Context, FlatRecord, Record } from './types.js';

interface FileNode {
  type: 'file';
  content: string;
}

interface ContextNode {
  type: 'context';
  children: { [key: string]: FileNode | ContextNode };
}

interface StoreRoot {
  children: { [key: string]: FileNode | ContextNode };
}

export class FileStorage implements StorageCapability {
  constructor(private filePath: string) {}

  private async load(): Promise<StoreRoot> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as StoreRoot;
    } catch {
      return { children: {} };
    }
  }

  private async save(root: StoreRoot): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(root, null, 2));
  }

  private navigate(root: StoreRoot, path: string): StoreRoot | ContextNode | FileNode | null {
    if (path === '' || path === '.') return root;
    const parts = path.split('/').filter(Boolean);
    let current: StoreRoot | ContextNode = root;
    for (const part of parts) {
      const children: { [key: string]: FileNode | ContextNode } = current.children;
      if (!(part in children)) return null;
      const node: FileNode | ContextNode = children[part];
      if (node.type === 'file') {
        return part === parts[parts.length - 1] ? node : null;
      }
      current = node;
    }
    return current;
  }

  private navigateParent(root: StoreRoot, path: string): { parent: StoreRoot | ContextNode; key: string } | null {
    const parts = path.split('/').filter(Boolean);
    const key = parts.pop();
    if (!key) return null;
    const parent = this.navigate(root, parts.join('/'));
    if (!parent || !('children' in parent)) return null;
    return { parent, key };
  }

  async readContext(path: string): Promise<Context> {
    const root = await this.load();
    const node = this.navigate(root, path);
    if (!node || !('children' in node)) {
      throw new Error(`Not a context: ${path}`);
    }

    const records: Record[] = [];
    for (const [key, child] of Object.entries(node.children)) {
      if (child.type === 'file') {
        const size = Buffer.from(child.content, 'base64').length;
        records.push({ key, type: 'file', size });
      } else {
        records.push({ key, type: 'context', size: Object.keys(child.children).length });
      }
    }

    return { path, records };
  }

  async readRecord(path: string): Promise<Buffer> {
    const root = await this.load();
    const node = this.navigate(root, path);
    if (!node || !('content' in node)) {
      throw new Error(`Not a file record: ${path}`);
    }
    return Buffer.from(node.content, 'base64');
  }

  async flatten(path: string): Promise<FlatRecord[]> {
    const root = await this.load();
    const node = this.navigate(root, path);
    if (!node || !('children' in node)) {
      throw new Error(`Not a context: ${path}`);
    }

    const result: FlatRecord[] = [];

    function walk(n: StoreRoot | ContextNode, prefix: string) {
      for (const [key, child] of Object.entries(n.children)) {
        const full = prefix ? `${prefix}/${key}` : key;
        if (child.type === 'file') {
          result.push({ key: full, size: Buffer.from(child.content, 'base64').length });
        } else {
          walk(child, full);
        }
      }
    }

    walk(node, '');
    return result.sort((a, b) => a.key.localeCompare(b.key));
  }

  async createRecord(path: string, content?: Buffer): Promise<void> {
    const root = await this.load();
    const parts = path.split('/').filter(Boolean);
    const key = parts.pop()!;

    let current: StoreRoot | ContextNode = root;
    for (const part of parts) {
      if (!current.children[part]) {
        current.children[part] = { type: 'context', children: {} };
      }
      const node: FileNode | ContextNode = current.children[part];
      if (node.type === 'file') throw new Error(`Path conflict: ${part} is a file`);
      current = node;
    }

    if (content !== undefined) {
      current.children[key] = { type: 'file', content: content.toString('base64') };
    } else {
      current.children[key] = { type: 'context', children: {} };
    }

    await this.save(root);
  }

  async writeRecord(path: string, content: Buffer): Promise<void> {
    const root = await this.load();
    const result = this.navigateParent(root, path);
    if (!result) throw new Error(`Invalid path: ${path}`);

    if (!result.parent.children[result.key] || result.parent.children[result.key].type !== 'file') {
      throw new Error(`Not a file record: ${path}`);
    }

    result.parent.children[result.key] = { type: 'file', content: content.toString('base64') };
    await this.save(root);
  }

  async deleteRecord(path: string): Promise<void> {
    const root = await this.load();
    const result = this.navigateParent(root, path);
    if (!result) throw new Error(`Invalid path: ${path}`);

    delete result.parent.children[result.key];
    await this.save(root);
  }
}
