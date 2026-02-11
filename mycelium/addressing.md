# Addressing

XPath-style addressing overlaid on the Mycelium model.
One scheme for navigating contexts, accessing records,
and reaching metadata.

## Path Segments

Navigate the context hierarchy. Each segment is a
context boundary where traversal accumulates metadata.

    /repo/projects/03-context-view

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
        <name>/             — one directory per protocol
          config.json       — protocol configuration (run, help, ...)
          ...               — implementation files

Each protocol is a self-contained directory. `config.json`
holds the configuration — at minimum a `run` entry with
the invocation command. Implementation files live alongside.

    .spl/proto/context-view/
      config.json           — { "run": "...", "help": "..." }
      cli.js                — entry point
      scan.js, haiccer.js, persist.js

## Data View

Filter out `.spl` to obtain a clean data picture.
Everything else is data. One convention, one filter.

## Protocol Invocation

The `spl` runner resolves and invokes protocols.

    spl <protocol> [args...]

The runner resolves the protocol name to
`.spl/proto/<protocol>/config.json` at the current
context, reads `run`, and hands off. Arguments are
protocol-specific — the runner does not interpret them.

    spl context-view /          — context-view with arg /
    spl evaluate                — evaluate, no args

**Fully qualified** — direct path to protocol entry:

    spl ./projects/03/.spl/proto/evaluate

The path before `.spl/proto/` becomes the cwd for the
invocation.

Detection: presence of `/` or `./` in the first
argument means fully qualified. Absence means named —
resolve at current context.
