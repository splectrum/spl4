/**
 * Context layer — the flat API implementation.
 *
 * Wraps a StorageCapability. On each operation:
 * 1. Traverses the path, accumulating metadata
 * 2. Enforces rules (mutability, permissions)
 * 3. Handles changelog based on mode
 * 4. Delegates storage to the inner capability
 */

import type { StorageCapability, Capability, Context, FlatRecord, Metadata, ContextDefs } from './types.js';
import { traverse } from './traverse.js';
import { appendEntry, deleteChangelog, changelogKey } from './changelog.js';

export class ContextCapability implements Capability {
  constructor(
    private storage: StorageCapability,
    private defs: ContextDefs,
  ) {}

  private meta(path: string): Metadata {
    return traverse(path, this.defs);
  }

  private assertMutable(meta: Metadata, operation: string, path: string): void {
    if (meta.mutable !== 'true') {
      throw new Error(`${operation} not permitted: context is immutable (${path})`);
    }
  }

  async create(path: string, content?: Buffer): Promise<void> {
    const meta = this.meta(path);
    this.assertMutable(meta, 'create', path);

    if (content !== undefined && meta.mode !== 'none') {
      if (meta.mode === 'log-first') {
        await appendEntry(this.storage, path, 'created', content);
        await this.storage.createRecord(path, content);
      } else {
        await this.storage.createRecord(path, content);
        await appendEntry(this.storage, path, 'created', content);
      }
    } else {
      await this.storage.createRecord(path, content);
    }
  }

  async read(path: string): Promise<Buffer> {
    return this.storage.readRecord(path);
  }

  async write(path: string, content: Buffer): Promise<void> {
    const meta = this.meta(path);
    this.assertMutable(meta, 'write', path);

    if (meta.mode === 'log-first') {
      await appendEntry(this.storage, path, 'written', content);
      await this.storage.writeRecord(path, content);
    } else if (meta.mode === 'resource-first') {
      await this.storage.writeRecord(path, content);
      await appendEntry(this.storage, path, 'written', content);
    } else {
      await this.storage.writeRecord(path, content);
    }
  }

  async delete(path: string): Promise<void> {
    const meta = this.meta(path);
    this.assertMutable(meta, 'delete', path);

    await this.storage.deleteRecord(path);

    if (meta.mode !== 'none') {
      await deleteChangelog(this.storage, path);
    }
  }

  async list(path: string): Promise<Context> {
    return this.storage.readContext(path);
  }

  async flatten(path: string): Promise<FlatRecord[]> {
    return this.storage.flatten(path);
  }

  async move(from: string, to: string): Promise<void> {
    const fromMeta = this.meta(from);
    const toMeta = this.meta(to);

    this.assertMutable(fromMeta, 'move (source)', from);
    this.assertMutable(toMeta, 'move (destination)', to);

    // Read source
    const content = await this.storage.readRecord(from);

    // Create at destination
    await this.storage.createRecord(to, content);

    // Move changelog if it exists
    const clFrom = changelogKey(from);
    const clTo = changelogKey(to);
    try {
      const clContent = await this.storage.readRecord(clFrom);
      await this.storage.createRecord(clTo, clContent);
      await this.storage.deleteRecord(clFrom);
    } catch {
      // No changelog
    }

    // Delete source
    await this.storage.deleteRecord(from);
  }
}
