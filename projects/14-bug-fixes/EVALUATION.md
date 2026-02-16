# Project 14: Uniform Factory Pattern — Evaluation

## Summary

Every protocol operation now follows one pattern: default
export async factory(execDoc) returning a bound operator.
Multi-function module files eliminated. All cross-protocol
access goes through execDoc.resolve. 31 root registrations,
4 project-scoped, 35 total operations. Test harness added
(35/35 pass). Net reduction: ~1500 lines deleted, ~400 added.

This project also documented the seven implementation
patterns (P1-P7), introduced quality gates as a concept
(functional + pattern), and wrote the autonomy gap analysis.

## Requirements Assessment

### R1: execDoc.resolve — PASS
doc.resolve looks up protocol/operation in the proto map,
dynamically imports the module, calls the default export
factory with the exec doc, caches the result, and returns
the bound operator. Used by all cross-protocol access.
Bootstrap (spl.mjs) is the only code that imports modules
directly — it creates the seed doc before resolve exists.

### R2: Boot simplification — PASS
spl.mjs no longer handles format selection. Config.json
reduced to `{ "module": "..." }`. Boot creates the exec
doc, attaches non-enumerable properties (map, prefix,
resolvePath, resolve), captures stdout/stderr via
write-through wrappers, and persists execution state
through mc.exec/complete. The spl wrapper passes a JSON
seed doc — no environment variables.

### R3: MC modules as factories — PASS
All mc protocols refactored to one-file-per-operation:
- mc.xpath/resolve (1 operation)
- mc.core: list, read, create, update, del (5)
- mc.data: list, read, create, update, del (5)
- mc.raw: list, read, create, update, del (5)
- mc.meta: list, read, create, update, del (5)
- mc.exec: create, drop, complete, fail (4)

25 new operation registrations. Each has a default export
factory and its own config.json.

### R4: Protocol operations use resolve — PASS
All protocol operations refactored:
- spl/init — rebuilds proto map via resolve
- stats/collect — resolves mc.data/list, mc.raw/read
- context-view/sync, scan — resolve through lib.js
- evaluate/run, status — resolve through lib.js
- tidy/scan, clean — resolve through lib.js

Shared protocol internals moved to lib.js (P3 convention).
No direct imports between protocols remain.

### R5: Haiku retry on parse failure — PASS
evaluator lib.js has tryCallClaude wrapping callClaude.
On unparseable JSON response, retries once before
recording failure. Uses the same prompt on retry.

### R6: Multi-line gate parsing — PASS
parser.js updated to capture full multi-line content for
numbered items and bullet points in section-based format.
Test suite covers both cases (suites/parser.js).

### R7: Cleanup — PASS
Removed:
- cli.js files (stats/collect/cli.js, tidy/scan/cli.js,
  tidy/clean/cli.js)
- Protocol-level config.json files (mc.core, mc.data,
  mc.raw, mc.meta, mc.exec, mc.xpath — replaced by
  operation-level registrations)
- Multi-function module files (core.js, data.js, raw.js,
  meta.js, exec.js, stats.js, context-view.js,
  evaluator.js, tidy.js)

## Quality Gates

### Pattern gates — all PASS
- P1 (Uniform Factory): verified by test suite
  (general/all modules have default export,
  general/factories return operators)
- P2 (Config as Indirection): verified by test suite
  (general/config contains only module)
- P3 (Lib Convention): lib.js files in context-view,
  evaluate, mc.exec, test — none registered
- P4 (Three Channels): no format functions in operators
- P5 (Minimize Conditionals): prefix is `.` at root,
  no root vs non-root branching
- P7 (Resolution Through Map): verified by test suite
  (general/all operations resolvable)

### Functional gates — all PASS
- Boot works end-to-end: spl test run succeeds
- stdout/stderr captured: write-through wrappers in boot
- Evaluator retries: tryCallClaude in evaluate/lib.js
- Multi-line gates: parser test suite covers both formats
- No stale files: all old multi-function/cli files removed

## Test Harness

New protocol: test/run at .spl/proto/test/. Seven suites:
boot (8), general (4), mc.core (6), mc.data (3),
mc.raw (5), mc.xpath (5), parser (4). Total: 35 tests.

The test harness itself follows the factory pattern and
runs via `spl test run`.

## Deployed

31 root operations, 4 project-scoped:
- `.spl/proto/mc.proto/resolve.js` + config
- `.spl/proto/mc.xpath/resolve.js` + config
- `.spl/proto/mc.core/{list,read,create,update,del}.js` + configs
- `.spl/proto/mc.data/{list,read,create,update,del}.js` + configs
- `.spl/proto/mc.raw/{list,read,create,update,del}.js` + configs
- `.spl/proto/mc.meta/{list,read,create,update,del}.js` + configs
- `.spl/proto/mc.exec/{lib,create,drop,complete,fail}.js` + configs
- `.spl/proto/spl/init.js` + config
- `.spl/proto/stats/collect.js` + config
- `.spl/proto/context-view/{lib,sync,scan}.js` + configs
- `.spl/proto/evaluate/{lib,run,status,parser}.js`
- `.spl/proto/test/{lib,run}.js` + config + 7 suites
- `projects/.spl/proto/evaluate/{run,status}/config.json`
- `projects/.spl/proto/tidy/{lib,scan,clean}.js` + configs

## External Changes

- `spl` — seed doc as JSON, no env vars
- `.spl/spl.mjs` — resolve, non-enumerable props, stream capture
- `.claude/rules/memory.md` — updated with project 14 state
- `mycelium/protocols.md` — updated protocol documentation
- `mycelium/patterns.md` — new: seven implementation patterns
- `splectrum/quality-gates.md` — new: quality gate framework
- `splectrum/autonomy.md` — new: autonomy gap analysis
- `CONTEXT.md` — regenerated

## Observations

### The refactoring validated the model
Moving from multi-function modules to per-operation
factories with map-based resolution was a large change
(~1900 lines touched). The model held — every operation
maps cleanly to factory(execDoc) → operator. No exceptions
needed, including the bootstrap case (mc.exec/create uses
a seed doc with minimum fields rather than special-casing).

### Patterns as documentation of translations
The seven patterns capture the translation from principle
to implementation. Once captured, any entity can apply
them mechanically. The test suite validates P1, P2, and P7
structurally — pattern violations caught before runtime.

### Test harness earned its place
35 tests covering boot, general patterns, and all mc
protocols. The general suite tests patterns structurally
(not just behavior). Tests run through the protocol system
itself (`spl test run`).

## Carry Forward

1. Cascading references — bring out-of-view data into view
   (read-only overlay, copy-on-write, nearest distance)
2. mc.raw compound operations (move, copy)
3. Stream consumers for execution data
4. Model + spawn protocol (capstone)
