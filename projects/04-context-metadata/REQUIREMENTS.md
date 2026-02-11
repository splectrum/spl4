# Project 04: Context Metadata — Requirements

## Goal

Define and implement the `.spl` metadata structure for
contexts. Mount the context-view protocol on this repo.
Update Mycelium definitions to reflect the addressing
and protocol model.

## Deliverables

### 1. Mycelium Definitions (done)

Update vocabulary, tools, model, and addressing to
reflect the `.spl` convention, protocol bindings, and
XPath addressing.

- `mycelium/vocabulary.md` — new terms: addressing,
  path segment, key access, .spl namespace, protocol,
  data view
- `mycelium/tools.md` — protocol binding model,
  invocation syntax, resolution
- `mycelium/addressing.md` — full addressing scheme
- `mycelium/model.md` — context definition correction

### 2. Metadata Structure

Create the `.spl/` structure at repo root:

    .spl/
      meta/
        context.json          — context type + properties
      proto/
        <name>/               — self-contained protocol dir
          config.json         — configuration (run, help, ...)
          ...                 — implementation files

JSON as uniform format for all `.spl/` entries.

### 3. Protocol Mounting

Mount `context-view` as a self-contained protocol at
repo root. Protocol directory contains config.json
and deployed implementation files.

### 4. `spl` Runner

Shell script that resolves a protocol name to
`.spl/proto/<name>/config.json`, reads `run`, executes.
Named mode only — fully qualified is carry-forward.

### 5. Carry Forward

- Fully qualified invocation mode (cwd shift)
- Two-layer metadata (type defaults + instance config)
- Context-level requirements (structural fitness)
- Haiccer output validation via requirements + evaluation
- File-level metadata (`.spl` suffix convention)
- Layer composition with `.spl` metadata
- Versioning / origin tracking for deployed protocols

## Quality Gates

- `.spl/` directory exists at repo root with meta/
  and proto/ subdirectories
- Protocol entry for context-view resolves to the tool
- Mycelium definitions are internally consistent
- Addressing model covers path segments, key access,
  metadata access, and protocol invocation
- Data view (filter out .spl) yields clean data picture
