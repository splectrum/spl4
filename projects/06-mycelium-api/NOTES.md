# Notes

## Real vs Virtual Contexts

A context is either real (physically present) or virtual
(defined by type, not yet instantiated).

- **Real** — exists physically. Has content, can be
  operated on.
- **Virtual** — defined in the parent's metadata as a
  candidate for instantiation. A type with config that
  isn't an instance yet.

Creating = making a virtual context real.
Compliance = does the candidate match the virtual type?
You cannot create a real context where no virtual of
that kind exists.

### Context metadata implication

Rather than "children must be of type X", a context
says "here are my virtual children." Each virtual child
is a type definition with config. The `*` wildcard means
any number of instances of this virtual type can become
real.

    projects/.spl/meta/
      context.json              — has virtual children
      project-instance/         — IS the virtual child

The project-instance type definition is literally the
virtual child definition. When projects/06-mycelium-api/
is created, a virtual child becomes real.

### resolve semantics

mc.xpath resolve returns:
- **Real** — path exists physically
- **Virtual** — path valid per type model, not yet physical
- **Error** — path makes no sense in the model

For now (without type resolution): real or error.
Virtual comes when type definitions are wired up.

## Scripting Semantics

Seamless error handling at the logical scripting level.
No try/catch, no if/else. Error handling is expression
syntax, not control structure:

    dosomething(mc.xpath(...)) or dosomethingelse()

Smooth conditional execution flow. If the first
expression fails, the second executes. The happy path
and fallback are at the same syntactic level.

Composable:

    do(x) or do(y) or do(z)

Properties:
- No boilerplate (no try/catch blocks)
- Error handling visible inline
- Happy path and error path at same syntactic level
- Errors propagate naturally through pipelines
- Fallbacks compose

This shapes the API design: operations that fail
produce errors that flow to the next alternative.
The "or" pattern is the fundamental error handling
primitive at the scripting level.

## Stateless Protocols

Protocols are stateless. No factories, no instances,
no closures hiding state. State is explicit and exposed.

The execution environment carries:
- **root** — git repository root (from environment)
- **cwd** — current position relative to root

Protocols receive what they need as parameters.
They don't own or hide state.

## Session

The session holds execution state:
- root (git repo root, from terminal environment)
- cwd (path relative to root, navigable)

Protocols pick up the session context — they don't
create their own. Root comes from the environment
(e.g. terminal session variable for CLI). cwd is
Mycelium's equivalent of shell cd.

## mc.xpath Architecture

mc.xpath is a location resolver. Not an operation
executor.

- Parse a path expression
- Resolve against the substrate (filesystem today)
- Return a location pointer

mc.raw receives the pointer and executes operations.
mc.xpath never reads or writes data — only resolves.

Today: filesystem passthrough.
Later: cascading references, layering, wider syntax.

## mc.raw Five Operations

Renamed from mc.core. The structural layer — five
operations on raw structure, no semantic filtering.

- list — directory children, depth-controlled flattening
- read — content as opaque bytes
- create — make a virtual context real
- update — change existing record
- delete — remove record

Create is an operation on a parent context (the parent
exists), not on the thing being created. The virtual
type in the parent determines what can be created.

## Protocol Bundle Architecture

    mc.xpath    — resolve locations (stateless)
    mc.raw      — five operations (stateless, structural)
      ↑
    mc.data     — mc.raw with .spl filtered out
    mc.meta     — mc.raw scoped to .spl/meta/
    mc.proto    — mc.raw scoped to .spl/proto/ + resolve

All stateless. All receive session/root as parameter.

## Global vs Local Protocols

**mc bundles (global):**
- mc.xpath, mc.raw, mc.data, mc.meta, mc.proto
- Same implementation everywhere in the repo
- Branch = version boundary
- Base-level data handling must be consistent
- Registered at repo root in .spl/proto/

**Local protocols (changelog, etc.):**
- Registered per-context in .spl/proto/
- Resolved via mc.proto at runtime
- Different implementations valid at different contexts
- When invoked, have mc bundles available to do their work

## Bootstrap Sequence

1. spl invoked at repo root (always)
2. spl reads mc.proto executable — direct file access
   (one known location, no protocols yet)
3. spl sets root in session variable
4. Boot mc.proto running — direct file access, assumes
   filesystem, assumes root
5. Boot mc.proto resolves all other mc bundles (mc.xpath,
   mc.raw, mc.data, mc.meta) — proper implementations
6. Proper mc.proto replaces boot mc.proto — uses mc.raw
   instead of direct file access, substrate-agnostic
7. System running. All protocol resolution through mc.proto.

**mc.proto is the only protocol with a boot implementation.**
Boot mc.proto is minimal: read .spl/proto/ at root using
direct file access. Just enough to resolve the real
mc bundles. Boot restrictions (filesystem, root as cwd)
don't leak into the running system.

Once booted, mc.proto resolves everything uniformly —
global mc bundles (registered at root) and local protocols
(registered per-context) through the same mechanism.

## Mycelium as Protocol Bundle (from project 05)

    mc.data(...)          — core data API
    mc.proto.resolve(...) — resolve a protocol executable

    spl                   — boundary: validate, invoke
    user → spl (validate) → mc.<proto> (trusted)

Validation at the boundary, trust internally.
