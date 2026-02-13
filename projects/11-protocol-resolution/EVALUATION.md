# Project 11: Protocol Resolution — Evaluation

## What Was Built

**Proto map** — mc.proto scans all .spl/proto/ directories
in the repo, builds a map of `protocol/operation` → context
+ config. Cached at .spl/exec/state/mc/proto/map.json.
Rebuilt when registrations change (mtime detection).
Resolution is a map lookup, not a filesystem walk.

**Operation-level registration** — each operation has its
own config.json specifying module path, function name, and
optional format function. The protocol is a namespace, the
operation is the unit of registration and invocation.
Enables partial API registration at different contexts.

**Factory pattern** — protocol operations are factories.
The exported function takes an execution document and
returns a bound operator. The exec doc is bound once in
the closure; the operator works with just operational
arguments. spl owns the lifecycle (create doc → invoke
→ complete), the operation just does its work.

**spl as orchestrator** — spl resolves protocol/operation
via the map, imports the module, creates the exec doc,
calls the factory, invokes the returned operator, completes
the doc, and formats the output. The full invocation
lifecycle in one place.

**Calling convention** — `spl <protocol> <operation> [path]
[args...]`. Operation is mandatory. spl knows the protocol
and operation before dispatching — validation is immediate.

**Bootstrap simplified** — the proto map builder IS the
bootstrap. The old chain (boot.js → mc.proto → mc.xpath
→ verify root) was dead code and has been removed.

## Design Changes

Three significant structural changes rolled out in one
project. Each simplified rather than complicated:

- **Operation-level registration** replaced protocol-level.
  Eliminated the need for spl to distinguish operations
  from paths in argv. Each operation is independently
  addressable.

- **Factory pattern** replaced standalone functions + CLI
  wrappers. Eliminated all per-operation cli.js files.
  The exec doc binds at factory time, flows naturally
  through the closure.

- **Map-based resolution** replaced the bootstrap chain.
  Eliminated boot.js, resolve.js, and the multi-step
  bootstrap sequence. One scan, one cache, one lookup.

The changes rolled out easily — each one reduced the
number of files, concepts, and moving parts.

## What We Learned

The factory pattern from spl2 transfers directly. It
solves "how does the operation access the exec doc"
without ambient state or per-call passing.

Operation-level registration costs nothing extra and
gives partial API registration for free. The granularity
is finer than needed today but correct for the model.

Top-level exec logging (start/finish) for all operations
is the right default. Data state change logging within
the operation happens only when needed — additional
logging means there is demand for data within.

## Friction

Initially wrote directly to live .spl/ directories
instead of developing in the project. Course-corrected
to develop in projects/11-protocol-resolution/src/ and
deploy when working.

First attempt tried to extract target path from argv
to feed the resolution algorithm. Failed because
operations and paths are indistinguishable positionally.
Resolved by making operation mandatory — spl always
knows protocol + operation before dispatching.

## Concerns

**SPL_ROOT still used by protocol modules.** Now that
all operations receive an exec doc through the factory,
protocol modules should get their mc dependencies from
the doc, not from SPL_ROOT + dynamic imports. spl
should resolve mc imports and attach them to the exec
doc before calling the factory. This makes protocol
modules pure — no imports, no env vars, no boilerplate.
SPL_ROOT stays only in spl.mjs and the map builder.
This is a boot activity for the next iteration.

**Scanner performance.** The map builder walks the
entire repo tree on every staleness check. Fine now.
Roadmap item for large repos.

## Changes Outside This Project

- .spl/spl.mjs — rewritten (map resolution, factory)
- .spl/proto/mc.proto/map.js — new (map builder)
- .spl/proto/mc.proto/boot.js — removed (dead code)
- .spl/proto/mc.proto/resolve.js — removed (dead code)
- .spl/proto/mc.proto/config.json — removed (old format)
- .spl/proto/stats/stats.js — refactored (factory, SPL_ROOT imports)
- .spl/proto/stats/collect/config.json — new (operation registration)
- .spl/proto/stats/cli.js — removed
- .spl/proto/stats/config.json — removed
- projects/.spl/proto/tidy/tidy.js — refactored (factory)
- projects/.spl/proto/tidy/scan/config.json — new
- projects/.spl/proto/tidy/clean/config.json — new
- projects/.spl/proto/tidy/cli.js — removed
- projects/.spl/proto/tidy/config.json — removed
- mycelium/protocols.md — updated (factory, registration,
  resolution, calling convention, module imports, logging)
- mycelium/bootstrap.md — rewritten (map-based bootstrap)
- mycelium/vocabulary.md — updated (protocol, factory, stack)

## Carry Forward

- Exec doc carries mc dependencies (eliminate SPL_ROOT
  from protocol modules) — boot activity
- Scope isolation + path rebasing
- Evaluator protocol
- Map-provided import resolution
- Scanner performance optimisation (roadmap)
- Stream consumers for exec data
