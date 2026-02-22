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
layers. References are read-only; modification uses
copy-on-write to the local context.

## Layer

A context stacked on another. Read falls through
top-down. Write goes to the local mutable layer.
Layers compose capabilities — each brings structure
and tools. Nearest distance applies to data, not
just metadata. (Direction — designed, not built.)

## Addressing

XPath-style scheme for navigating contexts, accessing
records, and reaching metadata. Path segments traverse
the context hierarchy. `@` accesses a record by key
(XPath attribute syntax). `.spl` accesses the metadata
namespace.

## Path Segment

One step in a context path. Each segment crosses a
context boundary where traversal accumulates metadata.

    /repo/projects/14-bug-fixes

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

A namespace for operations bound to a context. Lives
in `.spl/proto/<protocol>/<operation>/`. Each operation
has its own config.json (module path only).
Invoked via spl: `spl <protocol> <operation> [path]`.
Resolved via the proto map — cached scan of all
.spl/proto/ directories. See protocols.md.

## Factory (Protocol Pattern)

Protocol operations are factories. The exported function
takes an execution document and returns a bound operator.
The exec doc is bound once; the operator works with
just operational arguments. See protocols.md.

## Data View

Everything outside `.spl` is data. Filter out `.spl`
to obtain a clean data picture. One convention, one
filter.

## Session

Execution state carried by the exec doc. Root (from
seed doc JSON arg, set once by spl wrapper). Prefix
(CWD relative to root). Map (proto map). Protocols
read session state from the exec doc — they don't
read env vars or create their own state.

## Protocol Stack

The layered realization of the model. mc.xpath resolves
locations. mc.core provides five primitives (list, read,
create, update, del). mc.raw adds format interpretation
and compound operations (move, copy). mc.data, mc.meta,
mc.proto are semantic views on mc.core. See protocols.md.

## mc.core

Five primitive operations (list, read, create, update,
del). Buffer in, Buffer out. The stable contract.

## mc.raw

Richer structural access on mc.core. Format interpretation
(utf-8, JSON). Compound operations (move, copy).
Pre-semantic — raw structure, no meaning yet.

## Scope Boundary

The interface between two protocol invocations. Paths
are rebased bidirectionally at each boundary. Every
protocol reasons from its own root. See scope.md.
(Designed, not built.)

## Static / Dynamic (Protocol)

How a protocol was found. Static = registered at the
current context. Dynamic = inherited via ancestor chain
walk (implemented as longest prefix match in proto map).
Nearest distance determines which.

## Boot

The one-time bootstrap via spl.mjs. Parses the seed
doc JSON argument from the bash wrapper. Single seam
where the system reads its starting state. After boot,
everything flows through the exec doc and factory
pattern. See bootstrap.md.

## Execution Document

Plain data object carrying all runtime state for a
protocol execution. Passed explicitly, enriched by
the protocol with inputs, config, and results.
Logging = snapshotting the doc at desired frequency.
See execution.md.

## Execution Store (.spl/exec/)

Two concerns: data/ (raw faf stream, source of truth)
and state/ (derived consumer outputs, rebuildable).
Faf drops are immutable files named <ms-since-epoch>-<seq>.json.
mc protocols attribute state changes to the first non-mc
caller via the execution doc passed as optional parameter.
See protocols.md, execution.md.

## Fire and Forget (faf)

Non-blocking persistence of the execution doc. Drop the
data, move on. Each drop is immutable once written. The
drops form a temporal stream — consumers process it
independently. The execution is never burdened by what
happens to its drops after they land.

## Real / Virtual (Context)

A real context exists physically — has content, can be
operated on. A virtual context is defined in the parent's
metadata as a candidate for instantiation. Creating =
making a virtual context real. See model.md.
