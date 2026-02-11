# Vocabulary

## Record

A key mapped to content. Content is opaque bytes — the
model does not interpret it. Keys are meaningful only
within their containing context.

## Context

A bounded area that contains data structures. Contexts
nest recursively. The organizing unit of the data world.

## Metadata

Properties that determine behavior. Accumulated along
the context path during traversal. Nearest distance
wins — inner overrides outer.

## Mutable / Immutable

States a context can be in. Mutability is metadata, not
type. The same context can transition between states.
Mutable contexts permit writes and deletes. Immutable
contexts reject them.

## Changelog

A sibling record that tracks changes to its companion.
Three modes: none (no tracking), resource-first (resource
is truth, log is audit), log-first (log is truth,
resource is derived).

## Flat

A context marked flat treats its interior as content,
not sub-contexts. Traversal stops accumulating metadata
and hops directly to the resource.

## Traversal

Walking the path from root to target, accumulating
metadata at each context boundary. The accumulated
result determines what operations are permitted and
how they behave.

## Reference

A link from one context to another. Horizontal
references point to contexts at the same level
(remote repos, APIs). Vertical references create
layers.

## Layer

A context stacked on another. Read falls through
top-down. Write goes to the local mutable layer.
Layers compose capabilities — each brings structure
and tools. Nearest distance applies to data, not
just metadata.

## Tool

A capability invocable from a context. Atomic —
proprietary internals, compatible boundaries. The
name is the interface. The layer stack resolves the
implementation.

## Addressing

XPath-style scheme for navigating contexts, accessing
records, and reaching metadata. Path segments traverse
the context hierarchy. `@` accesses a record by key
(XPath attribute syntax). `.spl` accesses the metadata
namespace.

## Path Segment

One step in a context path. Each segment crosses a
context boundary where traversal accumulates metadata.

    /repo/projects/03-context-view

## Key Access (@)

Accesses a record by key within a context. Does not
traverse into the record.

    /repo/projects/@REQUIREMENTS.md

## .spl Namespace

The metadata namespace for a context. Contains
descriptive metadata (`.spl/meta/`) and protocol
bindings (`.spl/proto/`). For contexts: `.spl/`
directory inside. For records: `.spl` suffix as
sibling. Logically uniform — the capability layer
handles the physical difference.

## Protocol

A named capability interface bound to a context.
Protocol name is the key, capability binding is the
value. Lives in `.spl/proto/`. Invoked via the `spl`
runner — named mode resolves at a target context,
fully qualified mode carries the context in the path.

## Data View

Everything outside `.spl` is data. Filter out `.spl`
to obtain a clean data picture. One convention, one
filter.
