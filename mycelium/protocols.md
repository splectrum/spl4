# Protocols

The protocol stack is the realization of the Mycelium
model. It bridges abstract concepts (record, context,
operations) to running code.

## Session

The execution environment carries session state:

- **SPL_ROOT** — git repository root, from environment.
  Set once by the spl wrapper, read by every protocol.
- **cwd** — current position relative to root. Tied to
  scope isolation (see scope.md). Not yet implemented.

Protocols pick up session context from the environment.
They don't create or own state.

## The Stack

    mc.xpath        — resolve paths to locations
    mc.core         — five primitives (opaque bytes)
    mc.raw          — format interpretation, compound ops
      ↑
    mc.data         — user data view (.spl filtered out)
    mc.meta         — metadata view (.spl/meta/ scoped)
    mc.proto        — protocol resolution (.spl/proto/)

**mc.xpath** resolves logical paths to location pointers.
Not an operation executor — only resolves. Filesystem
substrate today. Later: cascading references, layering,
wider syntax.

**mc.core** is the stable foundation. Six primitive
operations (list, read, create, update, del, append).
Buffer in, Buffer out. No format interpretation, no
compound operations. The contract other protocols
build on.

**mc.raw** delegates to mc.core and adds richer
structural access. Format interpretation on read
(binary, utf-8, JSON). Format detection on write
(string → utf-8, object → JSON). Future: compound
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
Six operations, opaque bytes, minimal.

mc.raw is richer structural access built on mc.core.
Format interpretation, compound operations. Pre-semantic
— raw filesystem structures, no meaning yet. mc.raw
will grow (move, copy); mc.core won't.

## Factory Pattern

Protocol operations are factories. The exported function
takes an execution document and returns a bound operator:

    export function scan(execDoc) {
      return async function (path) {
        // execDoc is bound — context, config, logging
        // do work, return result
      };
    }

The exec doc is bound once at factory time. The returned
operator works with just operational arguments. No ambient
state, no globals — the execution context lives in the
closure.

spl creates the exec doc, calls the factory, invokes the
operator, completes the doc. The operation just does its
work.

## Module Imports

All protocol modules use dynamic imports via SPL_ROOT:

    const root = process.env.SPL_ROOT;
    function proto(path) {
      return pathToFileURL(join(root, path)).href;
    }
    const data = await import(proto('.spl/proto/mc.data/data.js'));

One pattern everywhere — root protocols and sub-context
protocols use the same mechanism. No relative imports
to sibling protocols.

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

## Registration

Operations are registered in .spl/proto/ directories
at the operation level:

    .spl/proto/
      stats/
        collect/config.json
      tidy/
        scan/config.json
        clean/config.json

Each config.json specifies module, function, and
optional format function:

    {
      "module": ".spl/proto/stats/stats.js",
      "function": "collect",
      "format": "format"
    }

Partial API registration: individual operations of a
protocol can be registered at different contexts.

## Resolution

**Proto map.** mc.proto scans all .spl/proto/ directories
in the repo and builds a map: `protocol/operation` →
context + config. Cached at .spl/exec/state/mc/proto/map.json.
Rebuilt when registrations change (mtime detection).

**Lookup.** Given `protocol/operation`, find registrations
in the map. Single registration: return it. Multiple:
longest prefix match of target path — nearest to the
target wins.

    spl tidy scan 08-dogfood
    → lookup "tidy/scan" → found at /projects → invoke

No separate global/local concept. mc bundles at root
are naturally global (found from anywhere). Override
by registering closer — naturally local. Same mechanism.

See scope.md for execution context and path rebasing.

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
