# Execution Model

How protocols execute, carry state, and log their work.

## The Execution Document

A plain data object that carries all runtime state for
a protocol execution. Not an ID with metadata — the
actual state. Passed explicitly, visible at all times.

The doc starts minimal (identity, timestamps) and grows
as the protocol enriches it with inputs, config, and
outputs. At any point, the doc is a complete snapshot
of where the execution stands.

    {
      uid, protocol, context, parentUid,
      timestamp, status,
      config: { ... },       // protocol adds
      input: { ... },        // outer context adds
      result: { ... }        // inner processing adds
    }

The doc is extensible by convention, not by schema.
Protocols add whatever keys they need. mc.exec manages
identity and persistence but doesn't dictate structure.

## Outer and Inner Context

Every protocol execution has an outer context. Complex
protocols also have an inner context.

### Outer Context (Boundary)

Sits on the system boundary. Has access to external
state — mc protocols, config, session, environment.

Responsibilities:
- Receive command, interpret, validate
- Read external state (mc.data, mc.raw, mc.meta)
- Assemble the execution doc with inputs and config
- Snapshot the doc (start)
- Hand off to inner processing
- Receive inner result back
- Extract output to external world (mc writes)
- Snapshot the doc (completion)

The outer context is the only part that touches mc
protocols. It translates between the external world
and the execution doc.

### Inner Context (Processing)

Receives the execution doc. Operates only on what's
in it. No mc protocol calls, no external state access.
Pure function of its inputs — data in, data out.

Properties:
- Testable without the mc stack
- Portable — doesn't know about Mycelium, filesystem,
  or any substrate
- Reproducible — same doc in, same result out
- Optional — simple protocols may not need a separate
  inner context

The inner context may have its own processing log,
written into the doc as it progresses. Config
determines granularity.

### Separation as Convention

The outer/inner boundary is a calling convention,
not an enforcement mechanism. A protocol can start
with everything inline and factor out the inner
processing later. The design supports gradual
separation without requiring it upfront.

## Logging as Snapshotting

Logging is persisting the execution doc at a point
in time. No separate log format — the doc IS the log.

### Minimum (two snapshots)

Every execution produces at least:
- **start** — doc after outer context assembles inputs
- **end** — doc after processing completes (or fails)

The diff between start and end is the change record.
Recovery restarts from the start snapshot.

### Configurable Frequency

Config can request additional snapshots:
- At step boundaries in a pipeline
- At every significant operation
- At any point the protocol chooses

Each snapshot is labelled (start, end, step name,
or sequence number). The doc at each snapshot is a
complete state — not a delta, not an event.

### Where Snapshots Live

- **Global log** (/.spl/exec/log): lean entries only.
  Identity, status, timestamps. The index. Small, fast,
  suitable for locking. Source of truth for lifecycle.
- **Local store** (<context>/.spl/exec/<proto>/<uid>/):
  full doc snapshots. start.json, end.json, additional
  snapshots. The detail. Disposable after retention
  period.

The global log stays small. Full state lives local to
the execution context.

## Lifecycle

    command arrives
      ↓
    OUTER: read external state, assemble doc
      ↓ snapshot (start)
    INNER: process doc (pure, no external access)
      ↓ snapshot (end)
    OUTER: extract output, write to external world
      ↓
    complete (or fail)

Status progression: created → running → completed | failed.

The global log records transitions. Local snapshots
record full state at each point.

## Nesting

A protocol execution may trigger another protocol
execution. The child execution carries the parent's
uid as parentUid. The global log records the tree.

Each nested execution has its own doc, its own
outer/inner boundary, its own snapshots. The parent
doesn't see the child's internal state — only the
result that comes back through the outer context.

## Gradual Iteration

The model starts simple and grows:

**Phase 1** — create, snapshot start/end, complete/fail.
Doc has identity + whatever the protocol adds. Inline
processing (no outer/inner separation yet).

**Phase 2** — factor out inner processing as pure
function. Testable without mc stack.

**Phase 3** — configurable snapshot frequency. Config
determines granularity per protocol or per execution.

**Phase 4** — doc carries references to external data.
Outer context resolves references and populates the
doc. Inner context sees resolved data only.

**Phase 5** — inner context receives frozen copy.
Produces new doc (or delta). Enforced purity.

Each phase is a natural evolution. No phase requires
reworking the previous one.

## mc.exec API (Minimal)

    create(protocol, context, parentUid?)
      → doc with identity, snapshot as start.json,
        append lean entry to global log

    snapshot(doc, label?)
      → persist doc to local store as <label>.json

    complete(doc)
      → snapshot as end.json, append to global log

    fail(doc, error?)
      → snapshot as end.json with error, append to
        global log

The protocol enriches the doc between create and
complete. mc.exec persists and indexes but doesn't
interpret the doc contents beyond identity fields.
