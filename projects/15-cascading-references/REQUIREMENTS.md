# Project 15: Cascading References (Repository Facet)

## Goal

A context can declare a reference stack: a local (mutable)
layer on top, followed by one or more remote (immutable
through this reference) layers. mc.xpath resolves the
stack position. mc.core handles layering — which layer to
read from, write always to local, list merges all layers.

This is the repository facet — the mechanical capability
for transparent traversal and overlay. The meaning facet
(links, AI-built knowledge hierarchies, context-optimized
views) is post-spl4 and builds on this foundation.

## Context

Mycelium provides structural tools two steps removed from
context. AI controls both data preparation and organization.
Cascading references give the AI the ability to bring
external data into view, internalize it (processed alongside
the source), and layer it at the right context depth. The
infrastructure doesn't prescribe what gets internalized or
how — it provides the mechanical capability.

## Use case

Each project references top-level documentation so it can
work in local scope only. Targets are logical paths
relative to the root context:

    projects/15-cascading-references/
      .spl/data/refs.json:
        {
          "PRINCIPLES.md": [{ "target": "/home/.../spl4/PRINCIPLES.md" }],
          "mycelium":      [{ "target": "/home/.../spl4/mycelium" }]
        }
      REQUIREMENTS.md          ← local
      PRINCIPLES.md            ← resolves through reference
      mycelium/patterns.md     ← resolves through reference

From project scope, list shows both local files and
referenced docs merged into one view. Read PRINCIPLES.md
— get the top-level version. Create a local PRINCIPLES.md
— shadows the reference, changes stay isolated. Merge
local modifications back to the source later.

## R1: Reference data

References are operational data, stored in `.spl/data/`.
A context declares its reference stack in
`.spl/data/refs.json`:

    {
      "external-docs": [
        { "target": "/absolute/path/to/primary/source" },
        { "target": "/absolute/path/to/secondary/source" }
      ]
    }

Each key is a name within this context (the mycelium-visible
name). The value is an ordered list of layers (first =
highest priority remote). The local filesystem is implicitly
the top layer — always present, always mutable. It is not
listed in refs.json.

**Mycelium paths are relative** — always relative to the
current context root. This is a mycelium principle.

**Filesystem remote targets are absolute** — for the local
filesystem capability, targets are absolute paths on the
device. The target may be outside the repo entirely
(another repo, another directory). Each substrate type
defines its own target format.

The full stack for a name:

    1. local (implicit, mutable)
    2. remote-1 (first in list, immutable through reference)
    3. remote-2 (second in list, immutable through reference)
    ...

`.spl/data/` is a new namespace within `.spl/`, alongside
`meta/`, `proto/`, and `exec/`.

The first capability for cascading references is local
filesystem remotes. Other remote types (mycelium server,
network) are a future extension — the format supports it
(add `type` or `scheme` fields later).

## R2: fs_cascading library

A substrate-specific library for filesystem-based
reference resolution. Lives at mc.xpath level (P3, P8).
Contains all filesystem interaction logic for reference
resolution.

**Filesystem primitives:**
- `fileExists(path)` — check existence (file or directory)
- `readJSON(path)` — read and parse JSON file
- `readdir(path)` — list directory contents
- `stat(path)` — safe stat (returns null on missing)

Other fs primitives as needed by the implementation.
Centralises all filesystem access for reference
resolution in one place.

**Two core methods:**

**list(root, contextAddress, refs)** — merged entries
across all layers for a context. Local entries first, then
reference layers in priority order. Local shadows
reference, higher-priority reference shadows lower.
Returns merged location entries with source information.
Used by mc.core/list.

**bucket(root, path, refs)** — all locations for a single
resource across all layers. Returns an ordered array:
local (if exists), then each reference layer. Used for
read resolution (top hit), duplication awareness, and
conflict detection.

For the filesystem capability, target paths in refs.json
are absolute. The library uses them directly as filesystem
addresses.

When other substrate types are needed (mycelium remote,
network), a different library handles that substrate's
resolution. mc.xpath dispatches based on reference type.

## R3: mc.xpath integration

mc.xpath delegates to fs_cascading for reference-aware
resolution. Two operations exposed:

**resolve(path)** — returns the highest-priority location
for a path. Calls bucket internally, returns the top hit.
Location object gains:
- `source` — `'local'` (default) or `'reference'`
- `ref` — when source is reference: reference details
  (context, name, target, layer position)

**resolveStack(path)** — returns layer buckets for a
context path. Used by mc.core/list. mc.xpath orchestrates,
fs_cascading does the substrate work.

Local resolution always takes priority over any reference
layer. Nearest distance.

mc.xpath reports WHERE something is in the stack. It does
not decide what to DO with that information — that is
mc.core's job.

## R4: mc.core/list layer merging

mc.core/list calls mc.xpath's resolveStack to get layer
buckets, then merges:

1. Local entries (highest priority)
2. Reference layers in order
3. Higher layers shadow lower layers with the same name

Result entries carry their `source` from mc.xpath. The
caller sees a merged view — local and referenced entries
together, no duplicates, highest-priority layer wins.

## R5: Read-through

mc.core/read works transparently through references.
mc.xpath resolves the path — local or reference — and
returns a location with an address. mc.core reads from
`location.address` as before.

This should require zero changes to read operations.
mc.xpath sets the address correctly for reference targets.
The same applies to mc.raw/read and mc.data/read — they
delegate to mc.core, which delegates to mc.xpath.

## R6: Write isolation

mc.core state-changing operations (create, update, del)
only operate on local repository storage. References are
read-only — you cannot modify the source through a
reference.

**Copy-on-write:** When a write targets a path that
currently resolves through a reference:

1. Create the local directory structure as needed
2. Write the resource locally
3. Future reads find the local version first (nearest
   distance)

**Delete on a referenced path:**
- If a local overlay exists, delete the local overlay.
  The reference re-emerges on next read.
- If no local overlay exists (resource only in reference),
  reject.

mc.core uses the location's `source` field from mc.xpath
to enforce this.

## R7: Read-only local layers

To make local data read-only without a permission system:
rename the physical folder to a hidden name, configure
mc.xpath to hide it, and reference it back under its
original name. The reference mechanism itself provides
immutability — mc.core cannot write to references.

    docs/  →  (rename to hidden location)
    refs.json: "docs" → [{ "target": "/abs/path/to/hidden-docs" }]

This is structural access control: the arrangement
determines mutability, not a flag. Reversible — undo the
rename, remove the reference. Sets primary access control
before any future permissions overlay.

mc.xpath needs a hiding mechanism: paths listed in
`.spl/data/hidden.json` (or similar) are not resolvable
by their physical name and excluded from list results.
The hidden resource only becomes visible through a
reference. fs_cascading handles this.

## R8: Tests

Extend the test harness with a `refs` suite:
- `.spl/data/refs.json` created and read correctly
- mc.xpath resolves through single reference
- mc.xpath resolves through stacked references (priority)
- mc.xpath local shadows reference (nearest distance)
- mc.core/list merges local + referenced entries
- mc.core/list respects layer priority (no duplicates)
- Read-through transparency (local and referenced)
- Copy-on-write (create on reference path creates locally)
- Delete of local overlay re-exposes reference
- mc.core rejects write to reference-only path
- Hidden local folder not resolvable by physical name
- Hidden folder accessible through reference (read-only)

Use a temporary directory as the reference target to keep
tests self-contained.

## Implementation phases

One project, built and tested incrementally:

1. fs_cascading library (filesystem primitives + refs.json
   reading) + mc.xpath single-reference resolution
   → test: path resolves through reference
2. Stack model + layer buckets (list + bucket methods)
   → test: priority, local shadows
3. mc.core integration — list merging via resolveStack,
   read-through, write isolation
   → test: merged views, copy-on-write
4. Hiding mechanism
   → test: hidden paths, read-only local
5. End-to-end — reference top-level docs into this project,
   verify full workflow

## Quality Gates

### Pattern gates
- P1 (Uniform Factory) — any new/changed operations
- P2 (Config as Indirection) — any new config.json files
- P3 (Lib Convention) — fs_cascading as substrate library
  within mc.xpath
- P5 (Minimize Conditionals) — layer resolution should
  be uniform, not special-cased per operation
- P7 (Resolution Through Map) — cross-protocol access
- P8 (Internal Efficiency) — fs_cascading reads refs.json
  and hidden.json directly, no protocol round-trip

### Functional gates
- `.spl/data/` namespace works as operational data store
- Filesystem targets are absolute paths
- mc.xpath resolves through reference stacks transparently
- Layer priority: local > remote-1 > remote-2 > ...
- List merges all layers, highest priority wins
- Read works identically for local and referenced resources
- Write creates locally, shadowing the reference
- Write rejected on reference-only paths
- Delete of overlay re-exposes reference layer
- Hidden paths invisible to direct resolution and listing
- Hidden paths accessible read-only through references
- No circular dependencies introduced
