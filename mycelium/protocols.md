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

## Calling Convention

Every protocol operation takes a path as its first
argument. The path determines what the operation acts on.

- **Upward (own context):** path is `.` — operate at
  the protocol's own root. Default when omitted.
- **Downward (descendant):** path is a forward pointer
  — at minimum the descendant's context root,
  optionally deeper.

    stats(path)             — stats on target
    tidy.scan(path)         — scan from target down
    tidy.clean(path)        — clean at target
    evaluate(path)          — evaluate project at target

mc protocols already follow this convention:
`mc.data.list(path)`, `mc.core.read(path)`. Extending
it to all protocol operations makes it universal.

The path is compact. A single path can address a
location multiple protocol scopes deep without the
caller needing to know where the boundaries are.

## Resolution

Protocols are registered in .spl/proto/ directories.
Resolution: walk the path, check for .spl/proto/ at
each context boundary. Nearest to the target wins.

    spl tidy 08-dogfood/src
    Walk: /projects/08-dogfood/src
      → src (no .spl) → 08-dogfood (no .spl)
      → projects (has .spl/proto/tidy) → found
    Context root: /projects
    Forward path: 08-dogfood/src

The path determines both which protocol resolves and
where it operates. One mechanism.

- **Static** — found at current context. Code lives here.
- **Dynamic** — found via ancestor walk. Inherited.

No separate global/local concept. mc bundles at root
are naturally global (found from anywhere). Override
by registering closer — naturally local. Same mechanism.

**Calling upward:** all protocols in ancestor contexts
are reachable, not just root. The path `.` resolves
up the chain from the current context.

**Calling downward:** the path naturally includes or
exceeds the descendant's context root. The segment up
to the context boundary is the descendant's execution
root. The remainder is within that scope.

See scope.md for execution context and path rebasing.

## Execution Store

`.spl/exec/` — third namespace alongside meta/ and
proto/. Holds transient execution state for protocol
operations.

    .spl/exec/
      <protocol-name>/
        <uid>/              — one execution instance
          start.json        — doc snapshot at creation
          end.json          — doc snapshot at completion
          ...               — additional snapshots

See execution.md for the execution document model,
outer/inner context separation, and snapshotting.

**Registration rule (compile-time):** mc protocols never
register. All other protocol operations that may change
data state always register — determined at design time
by the operation definition, not at runtime. A
state-changing operation always creates an exec instance,
even if a particular invocation happens not to change
anything. A read-only operation never registers.

**UIDs** identify execution instances. Even single-threaded,
UIDs give historical preservation, audit trail, and clean
lifecycle (create → run → complete/fail → archive/discard).

**Why mc protocols don't register:** mc is infrastructure
— the substrate through which other protocols work.
The meaningful audit is at the protocol level: what
operation changed what data and when. mc operations are
invisible plumbing underneath.

Designed, not yet built.

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
