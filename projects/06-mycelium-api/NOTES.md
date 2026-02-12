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

## Protocol Resolution — Ancestor Chain

mc.proto.resolve walks the ancestor chain: current
context → parent → grandparent → ... → root. First
match wins (nearest distance).

**Static vs dynamic:**
- Found at current context = static (code lives here)
- Found via ancestor walk = dynamic (inherited)

**No separate global/local concept.** mc bundles at root
are found from anywhere — naturally "global." Override
by registering closer — naturally "local." Same mechanism.

**Execution context:**
- Protocol runs at its static location (where registered)
- Working directory = registration context
- Forward scope only: protocol sees its subtree, not ancestors
- Registration determines data boundary

**Path rebasing:**
- Caller works in their frame (invocation context)
- Protocol works in its frame (registration context)
- Paths rebased automatically at invocation boundary
- Caller's context unchanged after protocol returns

### Scope Isolation

Every protocol invocation is a scope boundary.

When a protocol at /projects/06/ calls mc.core.list('/src'):
- Entering: /src rebased from caller's frame (/projects/06/)
  to mc.core's frame (root) → /projects/06/src
- Executing: mc.core works entirely in root frame
- Returning: results rebased back to caller's frame
- After: caller still at /projects/06/. Nothing leaked.

The scope switch is fully internal to the invocation.
Protocols are unaware of the caller's scope. The
invocation layer handles rebasing bidirectionally
(in and out), uniformly at every level.

This happens at every protocol-to-protocol call:
project protocol → mc.core, mc.core → mc.xpath,
local changelog → mc.raw. Same boundary mechanism
everywhere.

mc.xpath must understand context-relative paths,
not just root-relative. This is a natural extension
needed for rebasing to work.

### Path Semantics

Two distinct path contexts:

**At invocation (caller side):** relative paths. The
caller doesn't know where the protocol lives. Paths
are relative to the caller's context. Rebasing at
the invocation boundary translates them.

**Inside execution (protocol side):** absolute from
the protocol's own root. The registration context IS
the root. /src inside a protocol at /projects/06/
means /projects/06/src — but the protocol writes /src.

**Design invariant:** every protocol reasons from a
root node, under all circumstances. A protocol at
repo root and one at /projects/06/ write the same
code — absolute paths from their root. The scope
isolation guarantees this. No special cases, no
"where am I?" conditionals.

This is the context model expressed through protocols:
every context is a potential root. Protocols are written
against "a root," not "the repo root."

### Scope and References

- **Forward scope (own subtree):** read-write. The
  protocol's persistent domain.
- **Cascading references (remote contexts):** read-only.
  Data the protocol needs but doesn't own. Immutable
  views of external data projected into the protocol's
  frame.
- **Persistent effects stay within registration scope.**
  No writes leaking through references into contexts
  the protocol doesn't own. Read wide, write local.

Reference setup is a declaration of data dependencies:
the protocol needs to see these external contexts.
The scope boundary enforces that seeing ≠ modifying.

Future: visibility scope may be distance-based.
Local copy, visible within static protocol scope,
visible globally within repo. What you see depends
on how far you are from it. Nearest distance applied
to data visibility — structure determines access,
not bolted-on permissions.

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
