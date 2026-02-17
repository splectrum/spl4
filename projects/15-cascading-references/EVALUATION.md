# Project 15: Cascading References — Evaluation

## Summary

Contexts can declare reference stacks mapping local names
to remote filesystem targets. mc.xpath resolves transparently
through the stack (local > remote-1 > remote-2). mc.core
does the physical merge — readdir, shadow by priority, add
reference-only entries. Copy-on-write creates locally on
writes to referenced paths. Hiding mechanism provides
structural immutability without a permission system.

New substrate library (fs_cascading), new .spl/data/
namespace for operational data, P8 pattern (internal
efficiency). 66 tests (35 existing + 31 new refs suite).

## Requirements Assessment

### R1: Reference data — PASS
References stored in `.spl/data/refs.json`. Format:
name → ordered list of `{ "target": "/absolute/path" }`.
Local filesystem is implicitly the top layer (not listed).
`.spl/data/` established as operational data namespace
alongside `meta/`, `proto/`, `exec/`.

### R2: fs_cascading library — PASS
Substrate-specific library at `.spl/proto/mc.xpath/fs_cascading.js`.
Filesystem primitives (safeStat, fileExists, dirExists,
readJSON), reference data (readRefs, readHidden), reference
resolution (resolveRef), layer operations (bucket,
contextLayers). All filesystem interaction for reference
resolution centralised here. P3 (lib convention), P8
(direct access to operational data, no protocol round-trip).

### R3: mc.xpath integration — PASS
`operator(path)` — resolves to top-priority location with
`source` ('local' or 'reference') and `ref` details.
`operator.bucket(path)` — all layers for one resource.
`operator.layers(path)` — directory layer info (dirs,
hidden set, refs) for mc.core to merge. mc.xpath reports
WHERE, mc.core decides WHAT TO DO.

### R4: mc.core/list layer merging — PASS
mc.core/list calls `xpathResolve.layers()` to get layer
info, then does the physical merge: readdir each directory
layer in priority order, apply hidden, first-seen wins,
add reference-only entries from refs.json. Depth recursion
via `listDirect` uses physical addresses — works through
reference directories without re-resolving.

### R5: Read-through — PASS
Zero changes to mc.core/read. mc.xpath sets the address
correctly for reference targets. mc.raw/read and mc.data/read
inherit this transparently through the protocol chain.

### R6: Write isolation — PASS
mc.core/create: copy-on-write for reference parents (creates
local directory structure, writes there). mc.core/update:
copy-on-write for reference files (writes local equivalent).
mc.core/del: rejects when `source === 'reference'`. Delete
of local overlay re-exposes the reference beneath.

### R7: Read-only local layers — PASS
Hiding mechanism: `.spl/data/hidden.json` lists names
excluded from direct resolution and listing. Hidden entries
only accessible through references. Combined with a
reference back to the physical path, this makes local
data structurally read-only. Checked in resolveRef (walk
step), bucket (local exclusion), contextLayers (local
layer listing), and operator (main resolve).

### R8: Tests — PASS
31 tests in refs suite covering all phases:
- Phase 1 (8): basic resolution, nested, shadowing,
  read-through, nonexistent rejection
- Phase 2 (5): stacked priority, fallback, bucket, layers
- Phase 3 (5): mc.core/list merging, copy-on-write create,
  copy-on-write update, delete rejection
- Phase 4 (4): hidden resolution, read-through, listing,
  write rejection
- Phase 5 (9): end-to-end docs folder — list, read, nested
  read, nested list, flat list through references,
  copy-on-write with overlay/restore

## Quality Gates

### Pattern gates — all PASS
- P1 (Uniform Factory): no new operations registered —
  fs_cascading is a library (P3), not an operation
- P2 (Config as Indirection): no new config.json files
  for operations
- P3 (Lib Convention): fs_cascading is shared internal
  within mc.xpath, not registered
- P5 (Minimize Conditionals): layer resolution is uniform
  across all operations — source field drives behavior
- P7 (Resolution Through Map): mc.core accesses mc.xpath
  through execDoc.resolve, not direct import
- P8 (Internal Efficiency): fs_cascading reads refs.json
  and hidden.json directly — no protocol round-trip for
  operational data. contextLayers reads both once per context.

### Functional gates — all PASS
- `.spl/data/` namespace works as operational data store
- Filesystem targets are absolute paths
- mc.xpath resolves through reference stacks transparently
- Layer priority: local > remote-1 > remote-2
- mc.core/list merges all layers, highest priority wins
- Read works identically for local and referenced resources
- Write creates locally, shadowing the reference
- Write rejected on reference-only paths
- Delete of overlay re-exposes reference layer
- Hidden paths invisible to direct resolution and listing
- Hidden paths accessible read-only through references
- Flat list (depth) works through referenced directories

## Deployed

Modified:
- `.spl/proto/mc.xpath/resolve.js` — reference-aware
  resolve, hidden check, operator.layers, operator.bucket
- `.spl/proto/mc.core/list.js` — layer-aware merge with
  depth recursion via listDirect
- `.spl/proto/mc.core/create.js` — copy-on-write for
  reference parents
- `.spl/proto/mc.core/update.js` — copy-on-write for
  reference files
- `.spl/proto/mc.core/del.js` — write isolation (reject
  reference-only)

New:
- `.spl/proto/mc.xpath/fs_cascading.js` — filesystem
  substrate library
- `.spl/proto/test/suites/refs.js` — 31-test refs suite
- `projects/15-cascading-references/docs/.spl/data/refs.json`
  — end-to-end reference configuration

## External Changes

- `POSITIONING.md` — context management section
- `PRINCIPLES.md` — cascading references vision split into
  repository facet (building) and meaning facet (post-spl4)
- `mycelium/patterns.md` — P8: Internal Efficiency pattern
- `.claude/rules/memory.md` — updated scope, mc.git added,
  mc.xpath/select rename noted in roadmap

## Observations

### Clean separation emerged through iteration
The initial implementation had mc.xpath doing both resolution
and merging (listFromBucket). The user identified this as
inefficient — refs.json and hidden.json read repeatedly,
merge logic in the wrong layer. Refactoring to layers()
(mc.xpath provides info) + mergeAndRecurse (mc.core does
physical work) produced a cleaner, more efficient design.
The principle held: mc.xpath reports WHERE, mc.core does WHAT.

### .spl/data/ fills a real gap
Operational data (refs.json, hidden.json) needed a home
that wasn't metadata (.spl/meta/ — user-facing metadata)
or protocol code (.spl/proto/). The .spl/data/ namespace
gives operational data its own space. Clean distinction:
proto = code, meta = user metadata, data = operational data,
exec = execution state.

### Hiding is structural access control
Read-only local layers through hide+reference is elegant
because it uses the existing mechanism — no flags, no
permissions, just arrangement. Reversible by undoing the
rename and removing the reference. Sets primary access
control before any future permissions overlay.

### Agent context scoping is the practical payoff
The docs/ folder referencing top-level documentation into
a project demonstrates the real use case: an agent working
in project scope sees exactly what it needs. Combined with
memory as data (not infrastructure), the same mechanism
scopes agent knowledge. The blinkers are structural.

## Carry Forward

1. Formalize process standards (REQUIREMENTS.md,
   EVALUATION.md, build cycle, quality gates) as
   top-level referenceable docs — agents get process
   knowledge through cascading references, not prompts
2. mc.git protocol + changelog view
3. mc.raw compound operations (move, copy — git-aware)
4. Stream consumers for execution data
5. Model + spawn protocol (capstone)
6. mc.xpath/resolve → mc.xpath/select rename
7. Meaning facet: links, AI-optimized hierarchies,
   context-optimized views (post-spl4)
