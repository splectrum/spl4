# 08_context — Requirements

## Purpose

Introduce the context layer: a flat API surface with
traversal that accumulates metadata along the context path.
Metadata is transient (supplied at invocation), proving the
mechanics before stateful persistence is added later.

## Context

07 built the immutable/mutable API split with changelog
tracking. Discussion revealed: the API mixes record
operations (create, read, write, delete) with context
operations (list, flatten, move). Mutability is state, not
type — the same context can switch from mutable to immutable.
A flat API where all operations exist on one surface, with
metadata determining what's permitted, is the right design.
Context traversal accumulates metadata; the local operation
executes with the accumulated result.

## Requirements

### R1: Flat capability interface

One interface with all operations. No separate immutable
and mutable interfaces. API behavior is determined by
metadata supplied with the call (transient — not stored,
not read from the context). The caller provides context
definitions at invocation; the context layer traverses
the path and accumulates metadata; the operation executes
under the accumulated result.

Operations:

- `create(path, content?)` — create file or context
- `read(path)` — read content as opaque bytes
- `write(path, content)` — overwrite content
- `delete(path)` — remove record
- `list(path)` — list immediate children
- `flatten(path)` — list all descendants
- `move(from, to)` — relocate record between contexts

Operations that are not permitted under the accumulated
metadata throw a descriptive error (e.g. "write not
permitted: context is immutable"). The metadata is not
passed per-operation — it is resolved by the context
layer from the transient definitions supplied at
construction.

### R2: Metadata as key-value map

Metadata is a flat key-value map (string keys, string
values) passed to each operation. Known keys:

- `mutable` — "true" or "false". Default: "true"
- `mode` — "none", "log-first", or "resource-first".
  Default: "none"
- `flat` — "true" or "false". Default: "false"

The metadata map is the accumulated result of traversal.
Operations read from it to determine behavior.

### R3: Context traversal

Given a path and a set of context metadata definitions,
traverse the path and accumulate metadata:

- Each context in the path can contribute metadata
- Merge rule: nearest distance wins (inner overrides outer)
- A context with `flat: true` means its interior is
  content — traversal stops accumulating, hops directly
  to the target
- Contexts without metadata contribute nothing (pass-through)

Context metadata definitions are supplied at invocation
as a map of context paths to metadata. This is transient —
no persistence. Stateful metadata (read from records in
the context) is deferred.

### R4: Changelog as metadata-driven behavior

When metadata contains `mode: log-first` or
`mode: resource-first`, the context layer handles changelog
tracking automatically. When `mode: none`, no changelog.
This absorbs TrackedCapability's behavior into the context
layer — no separate wrapper needed.

Changelog mechanics remain as in 07: sibling record
(`{key}.changelog`), append-only, fingerprint entries.

### R5: Move operation

Move relocates a record from one context to another:

- Compound operation: read from source, create at
  destination, delete from source
- Metadata from both source and destination paths apply
  (source must allow delete, destination must allow create)
- Move of a tracked record includes its changelog

### R6: Both capabilities

The context layer wraps either folder-based or file-based
capability from 07. The inner capability is unchanged —
it just stores bytes. The context layer adds traversal,
metadata enforcement, and changelog behavior.

### R7: CLI

Extend the CLI from 07:

- All existing commands continue to work
- `move <from> <to>` — relocate record
- `--meta <path>=<key>:<value>` — supply context metadata
  (repeatable, for setting up transient context definitions)
- Remove `--mode` flag (absorbed into metadata)

## Quality Gates

- One flat interface with all operations
- Immutable context rejects write, delete, move-from
- Flat context skips interior traversal
- Mode: none produces no changelog
- Mode: resource-first and log-first produce changelog
- Move works across contexts with correct metadata checks
- Traversal accumulates and merges metadata correctly
- Both capabilities work identically under the context layer
