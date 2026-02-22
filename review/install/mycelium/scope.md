# Scope

How protocols see data, how invocations create
boundaries, and how paths translate between frames.

Designed, not yet built. Architecture settled during
spl4 projects 06-08. Fundamental for spl5 (dev
environments, spawn).

## Execution Context

A protocol runs at its registration context — where
it is statically registered in .spl/proto/. The
registration context is the protocol's root. Forward
scope only: the protocol sees its subtree, not
ancestors.

Registration determines the data boundary.

## Scope Isolation

Every protocol invocation is a scope boundary.

When a protocol at /projects/14/ calls mc.core.list('/src'):

- **Entering:** /src rebased from caller's frame
  (/projects/14/) to mc.core's frame (root) →
  /projects/14/src
- **Executing:** mc.core works entirely in root frame
- **Returning:** results rebased back to caller's frame
- **After:** caller still at /projects/14/. Nothing leaked.

The scope switch is fully internal to the invocation.
Protocols are unaware of the caller's scope. The
invocation layer handles rebasing bidirectionally
(in and out), uniformly at every level.

This happens at every protocol-to-protocol call.
Same boundary mechanism everywhere.

## Path Semantics

**At invocation (caller side):** relative paths. The
caller doesn't know where the protocol lives. Paths
are relative to the caller's context. Rebasing at the
invocation boundary translates them.

**Inside execution (protocol side):** absolute from the
protocol's own root. The registration context IS the
root. /src inside a protocol at /projects/14/ means
/projects/14/src — but the protocol writes /src.

**Design invariant:** every protocol reasons from a root
node, under all circumstances. A protocol at repo root
and one at /projects/14/ write the same code — absolute
paths from their root. The scope isolation guarantees
this. No special cases, no "where am I?" conditionals.

This is the context model expressed through protocols:
every context is a potential root. Protocols are written
against "a root," not "the repo root."

## Forward Scope and References

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

## Distance-Based Visibility (Direction)

Future: visibility scope may be distance-based.
Local copy, visible within static protocol scope,
visible globally within repo. What you see depends
on how far you are from it. Nearest distance applied
to data visibility — structure determines access,
not bolted-on permissions.
