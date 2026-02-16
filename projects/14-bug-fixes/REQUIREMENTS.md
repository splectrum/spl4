# Project 14: Uniform Factory Pattern

## Goal

One pattern for everything: protocol/operation, default
export factory that internalises the exec doc. No exceptions.
MC modules refactored to factories. All resolution through
execDoc.resolve. Three output channels: data state,
execution state, realtime state.

## R1: execDoc.resolve

The single way operations access other operations.
Looks up protocol/operation in the map, imports the
module, calls the default export factory with execDoc,
caches the bound operator, returns it. Boot's doc.resolve
uses default exports — no function name in config.

## R2: Boot simplification

Remove format handling from spl.mjs. Operators return
metadata on the exec doc — boot persists it via
exec.complete. Add stdout/stderr capture: boot intercepts
the streams transparently so operators write to console
normally. Captured output becomes part of execution state.

Config.json simplified to `{ "module": "..." }` — no
function or format fields. Default export is the factory.

## R3: MC modules as factories

Refactor all mc modules to the factory pattern. One file
per operation, default export:

- mc.xpath/resolve — no dependencies (bottom of stack)
- mc.core/list, read, create, update, del — resolves mc.xpath/resolve
- mc.data/list, read, create, update, del — resolves mc.core ops
- mc.raw/list, read, create, update, del — resolves mc.core ops
- mc.meta/list, read, create, update, del — resolves mc.core ops
- mc.exec/create, drop, complete, fail — no mc dependencies (boot infra)

Each default export is a factory: takes execDoc, returns
bound operator. Operation-level config.json for each
(~25 new registrations).

## R4: Protocol operations use resolve

Update all protocol operations to use execDoc.resolve
instead of direct imports. One file per operation,
default export:

- spl/init
- stats/collect
- context-view/sync, context-view/scan
- evaluate/run, evaluate/status
- tidy/scan, tidy/clean

## R5: Haiku retry on parse failure

When the evaluator's claude call returns unparseable
JSON, retry once before recording a FAIL.

## R6: Multi-line gate parsing

The section-based parser should capture multi-line
numbered items fully, not just the first line.

## R7: Cleanup

Remove stale cli.js files. Remove old protocol-level
config.json files from mc modules (replaced by
operation-level registrations). Remove old multi-function
module files replaced by per-operation files.

## Quality Gates

### Pattern gates
- Follows Uniform Factory pattern (P1) — all operations
- Follows Config as Indirection pattern (P2) — all config.json files
- Follows Lib Convention pattern (P3) — shared protocol internals
- Follows Three Channels pattern (P4) — no format functions
- Follows Minimize Conditionals pattern (P5) — no special-case branching
- Follows Resolution Through Map pattern (P7) — all cross-protocol access

### Functional gates
- Boot sequence works end-to-end
- stdout/stderr captured by boot infrastructure
- Evaluator retries on parse failure
- Multi-line gates captured correctly
- No stale files
