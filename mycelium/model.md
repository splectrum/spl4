# Mycelium Model

Mycelium is a data interaction model. It defines how
data is structured, accessed, and behaved — independent
of where or how data is physically stored or transmitted.

## The Primitive

**Record** = key → content (opaque bytes).

**Context** = container of records. Records can
themselves be contexts.

Keys are meaningful only within their containing context.
Content is opaque — the model does not interpret it.
Everything else (typing, hashing, references, meaning)
is layered above.

This primitive was proven sufficient across 9 projects
spanning storage, changelog, traversal, and evaluation.
No extensions were required.

## Operations

| Operation | Category | Description |
|---|---|---|
| list | read | Keys in a context |
| read | read | Content of a record |
| flatten | read | All keys recursively (relative paths) |
| create | write | New record |
| write | write | Overwrite existing record |
| delete | write | Remove a record |
| move | compound | Read + create + delete across contexts |

Compound operations (move, update) compose from
primitives. The operation set is minimal and complete.

## Three Layers

**Logical** — Structures and operations. What exists
and what you can do with it. Zero dependency on storage
or substrate. Pure interface.

**Capability** — Binds logical to physical. Implements
the operations against a specific substrate. Multiple
capabilities are interchangeable — same behavior,
different backing.

**Physical** — The substrate itself. Folders and files.
A single JSON file. A database. An API. A network call.
The physical layer has no opinions — it is whatever the
capability wraps.

The storage capability has zero knowledge of metadata,
mutability, or behavior. It stores and retrieves bytes.
All intelligence lives in the context layer above.

## Context Layer

The context layer sits between the logical interface
and the storage capability. It provides:

**Traversal** — Walk the path from root to target. At
each segment, check for context definitions (metadata).
Merge into accumulator. Nearest distance wins — inner
context overrides outer.

**Flat contexts** — A context marked flat means "my
interior is content, not sub-contexts." Traversal hops
over physical structure to the resource directly.

**Metadata-driven behavior** — Mutability, changelog
mode, and enforcement are driven by metadata accumulated
during traversal. No flags, no configuration. Structure
is behavior.

**Metadata sources** — Transient (supplied at invocation)
and stored (persisted as records in contexts). Both feed
the same accumulation. Merge mode determines precedence
when they conflict.

## Changelog

**Sibling record** — Changelog for `foo` is
`foo.changelog`, a record in the same context. Visible,
readable, flattenable. Not hidden metadata.

**Three modes:**
- **none** — no tracking (default; most records)
- **resource-first** — resource is truth, log is audit
- **log-first** — log is truth, resource is derived

**Cascading** — A context's changelog aggregates its
children's changelogs. Derived, not stored.

**Delete behavior** — Depends on structure. If a bin
sub-context exists, delete moves there. If not, delete
is permanent. Structure determines behavior.

## Behavioral Principles

**Structure is behavior.** No flags, no configuration.
A context with a bin has soft delete. A flat context
skips interior traversal. A context with changelog mode
tracks changes. What you build is how it behaves.

**Nearest distance.** Definitions reside closest to
their realization. A context's metadata lives in that
context, not in a central registry. Inner overrides
outer.

**Data-triggered processing.** Data state drives
progression. Each step reads inputs from records, writes
outputs as records. Presence/absence determines what
happens next. Stateless steps, data as checkpoint.

**Resolution spectrum.** The same meaning at different
granularity: natural language (opaque) → structured file
(partially explicit) → individual records in contexts
(fully explicit). All the same primitive at different
resolution.
