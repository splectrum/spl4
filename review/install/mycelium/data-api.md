# Data API

The core interaction model for data. One flat API surface
where structure and metadata determine behavior.

## Requirements

1. One interface with all operations — no separate
   interfaces for different data states

2. Seven operations: list, read, create, update, del,
   move, copy

3. Metadata accumulates along the context path during
   traversal — nearest context to the resource has final
   say

4. Mutability is state, not type — the same context can
   change between mutable and immutable

5. Changelog tracking is metadata-driven — mode determines
   whether and how changes are recorded

6. A flat context treats its interior as content, not
   sub-contexts — traversal hops directly to the resource

7. The API is substrate-independent — same operations,
   same behavior, regardless of physical backing

## Core concepts

The API depends on concepts defined in model.md:
record, context, metadata, traversal, mutability,
changelog, flat contexts, three layers.

## Protocol realization

The seven operations are realized across the protocol
stack:

- **mc.core** — five primitives (list, read, create,
  update, del). Buffer in/out.
- **mc.raw** — format interpretation + compound ops
  (move, copy). String/JSON in/out.
- **mc.data** — user data view (.spl filtered)
- **mc.meta** — metadata view (.spl/meta/ scoped)
