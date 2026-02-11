# Project 05: File-Level Metadata — Requirements

## Goal

Extend the `.spl` metadata model to file-level contexts.
Define document specs for repo-root files and project
instance type definitions. Establish enough structure
for the Mycelium API work to have real data to operate on.

## Deliverables

### 1. File-Level Metadata for Repo Root

`.spl` contexts for CLAUDE.md and CONTEXT.md as
immutable defaults referenced from the repo root's
`.spl/meta/`. Each is a full context (meta/ + proto/).

### 2. Project Instance Type Definition

`projects/.spl/meta/project-instance/` — the default
`.spl/` config for project instance folders. Includes
file-level metadata contexts for REQUIREMENTS.md and
EVALUATION.md. Same meta/proto shape throughout.

### 3. Design Notes

Capture Mycelium-as-protocol-bundle design and spl
boundary validation responsibility for the next project.

## Quality Gates

- Uniform schema: every context (file, directory, type
  definition) uses the same meta/proto structure
- Immutable defaults referenced from parent, not
  duplicated per instance
- Document specs describe structure and content in
  natural language
- Sufficient metadata structure exists for Mycelium
  API work to begin
