# Protocols

The protocol stack is the realization of the Mycelium
model. It bridges abstract concepts (record, context,
operations) to running code.

## Session

The execution environment carries session state through
the exec doc:

- **root** — git repository root. Read once from
  SPL_ROOT env by spl/boot, then carried on the exec
  doc. Protocol operations use doc.root, never the
  env var directly.
- **map** — the proto map. Non-enumerable property on
  the exec doc. Invisible to faf serialization, fully
  accessible in code.
- **prefix** — CWD relative to root. Set to `.` at
  repo root, `projects` from projects/, etc. Resources
  are resolved relative to prefix (POV). Functionality
  is root-relative.

Protocol operations receive session context through the
exec doc at factory time. They don't read env vars or
create their own state.

## Three Output Channels

Operations produce output through three distinct channels,
each with its own concern:

**Data state** — mycelium commits. Persistent, addressable,
the visible result. When an operation creates or updates
records, those changes live in mycelium. This is what
matters after the operation completes.

**Execution state** — the exec doc and faf drops. Detailed
internal record of what happened: inputs, config, timing,
results. Written to `.spl/exec/data/` as fire-and-forget
drops. For offline analysis, audit, debugging. The operator
returns metadata on the exec doc; boot persists it.

**Realtime state** — stdout/stderr. What's happening right
now. Boot captures the streams transparently — the operator
writes to console normally, unaware of capture. Ideal for
monitoring, progress, diagnostics. The captured stream
becomes part of the execution record.

The operator doesn't choose a channel — it naturally uses
all three. Writes to mycelium are data state. Return values
become execution state. Console output is realtime state.
Boot infrastructure handles capture and persistence.

## The Stack

    mc.xpath        — resolve paths to locations
    mc.core         — five primitives (opaque bytes)
    mc.raw          — format interpretation, compound ops
      ^
    mc.data         — user data view (.spl filtered out)
    mc.meta         — metadata view (.spl/meta/ scoped)
    mc.proto        — protocol resolution (.spl/proto/)

**mc.xpath** resolves logical paths to location pointers.
Not an operation executor — only resolves. Filesystem
substrate today. Later: cascading references, layering,
wider syntax.

**mc.core** is the stable foundation. Five primitive
operations (list, read, create, update, del).
Buffer in, Buffer out. No format interpretation, no
compound operations. Primitives only.

**mc.raw** delegates to mc.core and adds richer
structural access. Format interpretation on read
(binary, utf-8, JSON). Format detection on write
(string -> utf-8, object -> JSON). Future: compound
operations (move, copy). Pre-semantic — no meaning
in structures yet.

**mc.data** is mc.core with .spl filtered out. The user
data view. Excludes .spl from list results, rejects .spl
paths on read/create/update/del.

**mc.meta** is mc.core scoped to .spl/meta/. Caller
addresses relative to context (e.g. 'context.json'),
mc.meta adds the .spl/meta/ prefix. The caller doesn't
hardcode .spl paths.

**mc.proto** resolves protocol operations to configurations.
Builds a proto map by scanning .spl/proto/ directories
across the repo. The map is cached at
.spl/exec/state/mc/proto/map.json and rebuilt when
registrations change.

## mc.core vs mc.raw

Two distinct protocols, not versions of each other.

mc.core is the primitives — the stable contract.
Five operations, opaque bytes, minimal.

mc.raw is richer structural access built on mc.core.
Format interpretation, compound operations. Pre-semantic
— raw filesystem structures, no meaning yet. mc.raw
will grow (move, copy); mc.core won't.

## Factory Pattern

One pattern for everything. Every registered operation
is a default-export async factory. The factory takes
the exec doc, resolves its dependencies through
`execDoc.resolve()`, and returns a bound operator:

    export default async function (execDoc) {
      const coreRead = await execDoc.resolve('mc.core/read');

      return async function (path) {
        // coreRead + execDoc in closure
        // do work, return result
      };
    }

One file per operation. One default export per file.
The exec doc is bound once at factory time. Dependencies
resolved through `execDoc.resolve()` — the single way
operations access other operations. The returned operator
works with just operational arguments. No ambient state,
no globals — everything lives in the closure.

spl/boot creates the exec doc, resolves the operation
via the map, calls the factory, invokes the operator,
completes the doc. The operation just does its work.

**Config is indirection.** Each operation has a config.json:

    { "module": ".spl/proto/mc.core/read.js" }

Just the module path. Default export means no function
name needed. Config exists because code may not be local
— spawned repos, cascading references, P2P, parent
overrides child. The config is the seam.

## Calling Convention

CLI: `spl <protocol> <operation> [path] [args...]`

Operation is mandatory. Each operation is registered
independently — the protocol is a namespace, the
operation is the unit of registration and invocation.

    spl stats collect /projects/08-dogfood
    spl tidy scan
    spl tidy clean 08-dogfood

The operation's first argument is a path — determines
what the operation acts on.

- **Upward (own context):** path is `.` — operate at
  the protocol's own root. Default when omitted.
- **Downward (descendant):** path is a forward pointer
  — at minimum the descendant's context root,
  optionally deeper.

The path is compact. A single path can address a
location multiple protocol scopes deep without the
caller needing to know where the boundaries are.

## Resolution

**execDoc.resolve(key)** is the universal resolution
mechanism. Given a protocol/operation key:

1. Look up the map (cached on exec doc)
2. Import the module (via config.module path)
3. Call the default export factory with execDoc
4. Cache the bound operator
5. Return it

All operations resolve dependencies this way. No direct
imports between protocols. The map is the single source
of truth for what's available and where it lives.

**Proto map.** mc.proto scans all .spl/proto/ directories
in the repo and builds a map: `protocol/operation` ->
context + config. Cached at .spl/exec/state/mc/proto/map.json.
No staleness detection — the process that changes
registrations calls rebuild. `spl spl init` is the
explicit rebuild command.

**Lookup.** Given `protocol/operation`, find registrations
in the map. Single registration: return it. Multiple:
longest prefix match of target path — nearest to the
target wins.

    spl tidy scan 08-dogfood
    -> lookup "tidy/scan" -> found at /projects -> invoke

No separate global/local concept. mc bundles at root
are naturally global (found from anywhere). Override
by registering closer — naturally local. Same mechanism.

See scope.md for execution context and path rebasing.

## Registration

Operations are registered in .spl/proto/ directories
at the operation level. One pattern: protocol/operation.

    .spl/proto/
      mc.xpath/
        resolve/config.json
      mc.core/
        list/config.json
        read/config.json
        create/config.json
        update/config.json
        del/config.json
      stats/
        collect/config.json
      spl/
        init/config.json

Each config.json contains only the module path:

    { "module": ".spl/proto/mc.core/read.js" }

Partial API registration: individual operations of a
protocol can be registered at different contexts.

## Execution Store

`.spl/exec/` — third namespace alongside meta/ and
proto/. Two concerns:

    .spl/exec/
      data/                 — raw faf stream
        <protocol>/
          <uid>/
            <timestamp-seq>.json
      state/                — derived consumer outputs
        <consumer>/
          <artifacts>

**Data** is the source of truth. Fire-and-forget drops
of the execution doc at boundary entry, boundary exit,
and internal steps. Each drop is immutable, named by
`<ms-since-epoch>-<seq>`. The stream is temporal and
sortable.

**State** is derived from data and rebuildable.
Consumers process the stream: lifecycle indexes,
protocol resolution maps, audit views, compacted
summaries. All sit in state/.

**Top-level logging:** spl creates an exec doc for every
invocation (start/finish). All operations produce at
least two faf drops — boundary entry and boundary exit.
This is the audit baseline.

**Data state change logging:** additional logging within
the operation, only when the operation changes data state.
mc protocols attribute state changes to the calling
protocol via the exec doc passed as optional parameter.
When absent, the change is logged at repo root.

If there is additional logging demand (beyond start/finish),
that means there is demand for data within — the logging
is earned, not speculative.

See execution.md for the streaming model, trust zones,
and the execution document lifecycle.

## Single-Path Addressing (Direction)

Currently mc.meta and mc.proto take separate context
and key parameters. For cross-context access, a
single-path approach is being explored: walk path
segments deepest-first, check for .spl expansion at
each context boundary. The root selection of meta/proto
determines whether literal paths are tried. The
expansion logic follows from root selection, not the
other way around.

Designed, not yet built.
