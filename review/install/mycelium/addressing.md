# Addressing

XPath-style addressing overlaid on the Mycelium model.
One scheme for navigating contexts, accessing records,
and reaching metadata.

## Path Segments

Navigate the context hierarchy. Each segment is a
context boundary where traversal accumulates metadata.

    /repo/projects/14-bug-fixes

## Key Access (@)

Access a record by key within a context. XPath
attribute syntax. Does not traverse into the record.

    /repo/projects/@REQUIREMENTS.md

## Metadata (.spl)

Each context has a `.spl` metadata namespace. Contains
descriptive metadata and protocol bindings.

For contexts (directories): `.spl/` inside.
For records (files): `.spl` suffix as sibling.

At the logical level both are uniform — the capability
layer handles the physical difference.

    /repo/.spl/meta          — context metadata
    /repo/.spl/proto         — protocol bindings
    /repo/README.md/.spl/    — file metadata (logical)

## Metadata Structure

    .spl/
      meta/
        context.json        — descriptive (type, properties)
      proto/
        <protocol>/
          <operation>/
            config.json     — { "module": "<path>" }
            <impl>.js       — implementation file
          lib.js            — shared internals (optional)

Each protocol is a self-contained directory. Operations
are subdirectories with config.json containing only the
module path. Implementation files live alongside.

    .spl/proto/context-view/
      lib.js                — shared internals
      scan/config.json      — { "module": "..." }
      scan.js               — scan implementation
      sync/config.json      — { "module": "..." }
      sync.js               — sync implementation

## Data View

Filter out `.spl` to obtain a clean data picture.
Everything else is data. One convention, one filter.

## Protocol Invocation

The `spl` runner resolves and invokes protocols.

    spl <protocol> <operation> [path] [args...]

The runner resolves the protocol/operation key via
the proto map, imports the module, calls the factory
with the exec doc, and invokes the returned operator.
Arguments are protocol-specific.

    spl context-view sync        — sync CONTEXT.md
    spl evaluate run             — run evaluation

## Path Semantics Across Scope Boundaries

At a protocol invocation boundary, paths shift frame:

- **Caller side:** relative to caller's context.
- **Protocol side:** absolute from protocol's root
  (registration context).

The invocation layer rebases paths bidirectionally.
Every protocol reasons from a root node. See scope.md
for the full scope isolation model (designed, not
yet built).

## Ancestor Chain Resolution (Designed)

mc.proto.resolve walks the ancestor chain: current
context -> parent -> root. First match wins (nearest
distance). Protocols at root are naturally global.
Override by registering closer — naturally local.
Same addressing mechanism, no separate global/local
concept. See protocols.md.

Currently implemented as map-based lookup with longest
prefix match (equivalent behavior for registered
protocols).
