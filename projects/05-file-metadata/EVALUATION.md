# Project 05: File-Level Metadata — Evaluation

## What Was Built

File-level `.spl` metadata contexts for repo-root
documents (CLAUDE.md, CONTEXT.md) and a project
instance type definition with file-level specs for
REQUIREMENTS.md and EVALUATION.md.

### Repo Root File Metadata

    .spl/meta/
      CLAUDE.md.spl/meta/context.json   — instructions + mission spec
      CONTEXT.md.spl/meta/context.json  — generated context description spec

Referenced from `.spl/meta/context.json` via `children`
entries with `"context": "CLAUDE.md.spl"` pattern.

### Project Instance Type Definition

    projects/.spl/meta/
      context.json                      — childType: project-instance
      project-instance/
        meta/
          context.json                  — requires + allowAny, refs file contexts
          REQUIREMENTS.md.spl/          — full .spl context for requirements doc
          EVALUATION.md.spl/            — full .spl context for evaluation doc
        proto/

The type definition IS the default `.spl/` config for
instances. Same shape, ready for cascading when it
arrives.

## Key Decisions

### A context is a context

No distinction between file and directory metadata at
the schema level. Both get identical meta/proto
structure. The capability layer handles the physical
difference (sibling vs interior). This was validated
throughout — no special cases needed.

### Immutable defaults in parent, local only for overrides

File metadata contexts for immutable (type-default)
specs live in the parent's `.spl/meta/`, referenced
from `context.json`. A local `.spl` context alongside
the file is only created when overriding the default.
This eliminates duplication without needing cascading.

### Explicit structure first, optimize later

Full directory structure written out by hand. Verbose
but visible — everything is inspectable. Optimization
(overlays, compression, tooling) comes after the shape
settles.

### `*` wildcard for child references

For contexts where all children conform to the same
type (like `projects/`), the reference path uses `*`
(e.g., `*/.spl`). Exact syntax to be settled during
Mycelium API work.

### `context` not `spl` for references

References to file metadata use `"context"` as the key
because the referenced thing is a full context with
meta/ and proto/ — not just a metadata pointer.

## What We Learned

### The uniform schema holds

Files, directories, type definitions, document specs —
all use the same meta/proto shape. Zero special cases
across five different uses. The abstraction is sound.

### Nesting depth is the cost of correctness

Paths like `projects/.spl/meta/project-instance/meta/
REQUIREMENTS.md.spl/meta/context.json` are deep. This
is where the Mycelium API earns its keep — xpath
navigation and protocol-based access will make this
transparent.

### Three layers of readiness

1. Structure (this project) — enough metadata to work with
2. API (next) — Mycelium navigates and accesses it
3. Enforcement (later) — evaluation protocol validates

Each layer builds on the previous. We're ready for
layer 2.

### spl as boundary validator

Design captured: spl owns schema validation at the
boundary. Internal mc calls are trusted. Protocol
config.json can carry schemas. This connects file-level
metadata (the schemas) to protocol invocation (the
validation). Implementation is next project territory.

## Changes Outside This Project

- `.spl/meta/context.json` — updated with children refs
- `.spl/meta/CLAUDE.md.spl/` — new file metadata context
- `.spl/meta/CONTEXT.md.spl/` — new file metadata context
- `projects/.spl/` — new, type definition for project instances

## Current Limits

The `.spl` metadata structure reflects our current
understanding — a working hypothesis, not a finished
design. The meta/proto bucket structure will take time
to settle. We have designed and built to the limit of
what can be reasoned about without running real tools
against it.

Implementing POC tools (Mycelium API, xpath navigation,
protocol resolution) and running them against this
structure will be the real test. Code that has to
traverse, read, and validate the metadata will expose
what works, what's awkward, and what needs adjustment.
The structure will evolve through use.

## Carry Forward

- Mycelium API as protocol bundle (mc.core, mc.protoResolve)
- spl boundary validation against `.spl` schemas
- xpath navigation / selection in Mycelium
- `*` wildcard reference syntax (settle during API work)
- Evaluation protocol (enforcement layer)
- Per-instance metadata via cascading
- Two-layer metadata (type defaults + instance config)
