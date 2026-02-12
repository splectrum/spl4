# Protocols

The protocol stack is the realization of the Mycelium
model. It bridges abstract concepts (record, context,
operations) to running code. All protocols are stateless
— no factories, no instances, no closures hiding state.

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

**mc.core** is the stable foundation. Five primitive
operations (list, read, create, update, del). Buffer
in, Buffer out. No format interpretation, no compound
operations. The contract other protocols build on.

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

**mc.proto** resolves protocol names to configurations.
Reads .spl/proto/<name>/config.json. Has a boot
implementation (direct file access) and a proper
implementation (via mc.core). See bootstrap.md.

## mc.core vs mc.raw

Two distinct protocols, not versions of each other.

mc.core is the primitives — the stable contract that
doesn't change. Five operations, opaque bytes, minimal.

mc.raw is richer structural access built on mc.core.
Format interpretation, compound operations. Pre-semantic
— raw filesystem structures, no meaning yet. mc.raw
will grow (move, copy); mc.core won't.

## Stateless Design

No protocol maintains state between calls. Every
invocation is independent. The session (environment
variables) is the only shared state, and it's explicit
and external.

This means:
- No initialization required
- No coupling between calls
- Any protocol can be replaced without teardown
- Testing is straightforward — set env, call function

## Resolution

Protocols are registered in .spl/proto/ directories.
mc.proto resolves a protocol name by reading its
config.json. Today: single-level resolution at root.

**Designed (not yet built):** ancestor chain resolution.
mc.proto.resolve walks current context → parent →
grandparent → root. First match wins (nearest distance).

- **Static** — found at current context. Code lives here.
- **Dynamic** — found via ancestor walk. Inherited.

No separate global/local concept. mc bundles at root
are naturally global (found from anywhere). Override
by registering closer — naturally local. Same mechanism.

See scope.md for execution context and path rebasing.

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
