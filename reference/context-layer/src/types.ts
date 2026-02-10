/**
 * Mycelium logical layer — flat API with metadata.
 *
 * One interface, all operations. Metadata determines
 * what's permitted. No separate immutable/mutable types.
 */

/** A record is an entry in a context. */
export interface Record {
  key: string;
  type: 'file' | 'context';
  size: number;
}

/** A context is a container of records. */
export interface Context {
  path: string;
  records: Record[];
}

/** A flattened record with its full logical path. */
export interface FlatRecord {
  key: string;
  size: number;
}

/** A changelog entry. */
export interface ChangelogEntry {
  timestamp: string;
  operation: 'created' | 'written' | 'deleted';
  fingerprint: string;
  key: string;
}

/** Metadata is a flat key-value map. */
export type Metadata = { [key: string]: string };

/**
 * Context metadata definitions — maps context paths to
 * their metadata. Supplied at invocation (transient).
 */
export type ContextDefs = { [contextPath: string]: Metadata };

/**
 * Storage capability — the raw substrate operations.
 * No metadata awareness. Just stores bytes.
 */
export interface StorageCapability {
  readContext(path: string): Promise<Context>;
  readRecord(path: string): Promise<Buffer>;
  flatten(path: string): Promise<FlatRecord[]>;
  createRecord(path: string, content?: Buffer): Promise<void>;
  writeRecord(path: string, content: Buffer): Promise<void>;
  deleteRecord(path: string): Promise<void>;
}

/**
 * The flat API — one surface, all operations.
 * Metadata controls behavior.
 */
export interface Capability {
  create(path: string, content?: Buffer): Promise<void>;
  read(path: string): Promise<Buffer>;
  write(path: string, content: Buffer): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<Context>;
  flatten(path: string): Promise<FlatRecord[]>;
  move(from: string, to: string): Promise<void>;
}
