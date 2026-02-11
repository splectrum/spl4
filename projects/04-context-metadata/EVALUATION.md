# Project 04: Context Metadata — Evaluation

## What Was Built

Context metadata structure (`.spl/`), protocol mounting,
addressing model, and the `spl` runner. End-to-end
protocol invocation: `./spl context-view` resolves,
reads config, executes the tool, produces CONTEXT.md.

### Metadata Structure

    .spl/
      meta/
        context.json                — { "type": "exploratory-repo" }
      proto/
        context-view/
          config.json               — { "run": "...", "help": "..." }
          cli.js, scan.js, ...      — deployed implementation

### Addressing Model

XPath-style addressing in `mycelium/addressing.md`:
path segments for traversal, `@` for key access, `.spl`
for metadata namespace. Protocol invocation via the
`spl` runner.

### `spl` Runner

Eight-line shell script. Resolves protocol name to
`.spl/proto/<name>/config.json`, reads `run`, executes
with args passed through. All text (help, usage) lives
in `config.json`, not in the runner.

## Key Decisions

### `spl` as the runner name

Splectrum is the realm of meaning. `spl` is both the
metadata namespace (`.spl/`) and the invocation command.
One identity across data conventions and runtime.

### Protocols as self-contained directories

Each protocol is a directory with `config.json` and
implementation files. Deployable, self-contained, and
extensible — future additions (versioning, origin,
help docs) are just more files in the directory.

### JSON as uniform `.spl/` format

All entries in `.spl/` are JSON. Any tool reading
metadata gets structured data. No format detection.
Extensible — add fields as needed without changing
conventions.

### Deployed vs development separation

The tool source lives in `projects/03-context-view/src/`
for development. The compiled implementation is deployed
into `.spl/proto/context-view/`. Development and
deployment are decoupled.

### Text lives in data, not in tools

The runner has no help text, no usage strings. Protocol
descriptions, help, and any future text live in
`config.json`. The runner is pure mechanics.

### `spl <protocol> [args...]` — general form

The runner resolves and hands off. Arguments are
protocol-specific — the runner does not interpret
them. This keeps the runner thin and protocols free
to define their own argument semantics.

## What We Learned

### The `.spl` convention is load-bearing

One namespace, one filter. Data view = everything
outside `.spl/`. Metadata = everything inside `.spl/`.
This single convention supports descriptive metadata,
protocol bindings, and future extensions (file-level
metadata, layer composition) without additional rules.

### Protocol directories are more than config

Starting with a flat `context-view.json` file, we
evolved to a directory that holds config + implementation.
The directory is a natural unit for deployment,
versioning, and future origin tracking. The structure
scaled gracefully.

### Two-layer metadata is coming

Both git-tracked: an immutable layer (type defaults)
overlaid by a mutable layer (instance config). This
applies Mycelium's own layer model to its metadata.
Not needed yet — noted for when protocol configurations
need per-instance overrides.

### The `spl` runner proved the model

Going from addressing concepts to working invocation
validated the design. The runner is trivially simple
because the metadata structure does the real work —
conventions over code.

## Changes Outside This Project

- `mycelium/vocabulary.md` — added addressing, path
  segment, key access, .spl namespace, protocol,
  data view terms
- `mycelium/tools.md` — rewritten for protocol binding
  model and `spl` runner
- `mycelium/addressing.md` — new file, full addressing
  scheme
- `mycelium/model.md` — corrected context definition
- `.spl/meta/context.json` — repo root metadata
- `.spl/proto/context-view/` — deployed protocol
- `spl` — runner script at repo root

## Carry Forward

- Fully qualified invocation mode (cwd shift)
- Two-layer metadata (type defaults + instance config)
- File-level metadata (`.spl` suffix convention) —
  next project: tool input/output/internal requirements
- Mycelium core API integration
- Versioning / origin tracking for deployed protocols
- Context-level requirements (structural fitness)
- Haiccer output validation via requirements + evaluation
