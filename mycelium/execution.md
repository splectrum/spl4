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

## Trust Model

Three zones govern execution integrity:

**Boundary** — validation happens here. Inputs,
permissions, shape. The outer context validates
before handing off to processing.

**Inside** — trusted execution. No internal policing,
no self-verification overhead. The execution is fast
and trusted.

**External** — assurance through observation. Log stream
analysis operates across/outside the boundary, not
within the execution. If proper operation needs to be
verified, the logging stream is the input. Enforcement
is independent from execution.

This separation means execution is never burdened with
proving its own correctness. Correctness is observed
externally from the facts the execution produces.

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

## Logging as Streaming

Logging is fire-and-forget (faf): persist the execution
doc and move on. The execution never waits for logging
to complete. Each drop is immutable once written.

The drops form a stream — temporal, append-only, the
raw source of truth. Everything derived (lifecycle
indexes, audit views, metrics) is a consumer of this
stream.

### Faf Drops

Each drop is a file. The filename is a timestamp-offset
pair: `<ms-since-epoch>-<seq>.json`. Sequence starts
at 0, increments when two drops share the same
millisecond. Sortable, no collisions.

    1739445564915-0.json     — boundary entry
    1739445564916-0.json     — internal step
    1739445564916-1.json     — same ms, second drop
    1739445564920-0.json     — boundary exit

Each drop contains the full execution doc at that
moment — complete state, not a delta, not an event.

### Minimum (two drops)

Every execution produces at least:
- **Boundary entry** — doc after outer context assembles
  inputs (the inbox)
- **Boundary exit** — doc after processing completes or
  fails (the outbox)

The diff between the two is the change record.
Recovery restarts from the entry drop.

### Partitioning

Drops can be partitioned by folder:

    <uid>/
      inbox/                — boundary entry
        <timestamp-seq>.json
      outbox/               — boundary exit
        <timestamp-seq>.json
      session/              — internal processing
        <timestamp-seq>.json

Folder + filename = topic-keyed partitioned stream.
To start: all drops in one folder (flat). Partitioning
is a configuration setting, not a structural change.

### Execution Store Structure

    .spl/exec/
      data/                 — the stream (raw faf drops)
        <protocol>/
          <uid>/
            <timestamp-seq>.json
            ...
      state/                — consumer outputs (derived)
        <consumer>/
          <artifacts>

Data is the source of truth. State is derived and
rebuildable from data. Consumers process the stream
and produce compacted views, indexes, or operational
state (e.g. protocol resolution map).

### Configurable Frequency

Config determines how many drops an execution produces
beyond the minimum two. Options:
- At step boundaries in a pipeline
- At every significant operation
- At any point the protocol chooses

## Lifecycle

    command arrives
      ↓
    OUTER: read external state, assemble doc
      ↓ faf drop (boundary entry)
    INNER: process doc (pure, no external access)
      ↓ faf drop (boundary exit)
    OUTER: extract output, write to external world
      ↓
    done

Status in the doc: running → completed | failed.

## Nesting

A protocol execution may trigger another protocol
execution. The child execution carries the parent's
uid as parentUid. The stream captures the tree.

Each nested execution has its own doc, its own
outer/inner boundary, its own drops. The parent
doesn't see the child's internal state — only the
result that comes back through the outer context.

## Gradual Iteration

The model starts simple and grows:

**Phase 1** — create, complete/fail. Two faf drops per
execution (boundary entry + exit). All drops in one
folder. Inline processing (no outer/inner separation).

**Phase 2** — factor out inner processing as pure
function. Internal faf drops during processing.
Testable without mc stack.

**Phase 3** — inbox/outbox/session partitioning.
Configurable drop frequency per protocol or execution.

**Phase 4** — stream consumers. Lifecycle index,
protocol resolution map, audit views — all derived
from the data stream into state/.

**Phase 5** — doc carries references to external data.
Outer context resolves references and populates the
doc. Inner context sees resolved data only.

**Phase 6** — inner context receives frozen copy.
Produces new doc (or delta). Enforced purity.

Each phase is a natural evolution. No phase requires
reworking the previous one.

## State Change Attribution

mc protocols are infrastructure — they don't own
executions. State changes (create, update, delete,
append) pass through mc but are caused by the calling
protocol.

Attribution follows the call stack: the first non-mc
protocol is the owner. The execution doc flows
explicitly through mc calls as an optional parameter:

    mc.core.del(path)              → no attribution
    mc.core.del(path, { exec })    → attributed to exec owner

When an exec doc is present, mc.core records the state
change in the doc. When absent (direct mc call with no
protocol context), the change is logged at repo root.

This means:
- The exec doc is visible at every call site
- Attribution is immediate and precise, not derived
- Read-only mc calls carry no overhead (no doc passed)
- No ambient state, no hidden "current execution"
- mc protocols don't register themselves — they
  attribute to their caller

The protocol creates the doc, passes it through mc
calls that may change state, and completes it. mc
protocols are transparent conduits that record facts
in the doc they receive.

## mc.exec API (Minimal)

    create(protocol, context, parentUid?)
      → doc with identity, faf drop (boundary entry)

    drop(doc)
      → faf drop at current state (internal step)

    complete(doc)
      → set status completed, faf drop (boundary exit)

    fail(doc, error?)
      → set status failed, faf drop (boundary exit)

Each drop writes `<ms-since-epoch>-<seq>.json` to
the execution's data directory. The protocol enriches
the doc between create and complete/fail. mc.exec
handles persistence and naming — the protocol just
calls drop when it wants to capture state.
