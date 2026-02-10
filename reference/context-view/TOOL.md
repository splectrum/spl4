# context-view

## Identity

A Splectrum tool that produces a self-describing context
summary of a Mycelium repository. Reads the repo structure
and generates a cold-start orientation document (CONTEXT.md).

Two operations:
- **show** — render context summary to stdout
- **sync** — generate/update CONTEXT.md at repo root

## Purpose

Any entity entering a repository needs orientation: what
is this, where are we, what happened, what's next.
context-view produces that orientation automatically by
scanning the repo structure and extracting meaning from
project evaluations.

## Inputs

- A repository root path
- Repository structure: root markdown documents, project
  directories with evaluation records

## Outputs

- Context summary (stdout or CONTEXT.md file)
- Immutable timeline entries (append-only, sealed once written)
- Mutable state section (regenerated on each sync)

## Structural Assumptions

This tool currently assumes a specific repository layout.
These assumptions are candidates for configuration:

- **Root marker**: `CLAUDE.md` identifies the repo root
- **Projects directory**: `projects/` in repo root
- **Project evaluation**: `EVALUATION.md` in each project
- **Output file**: `CONTEXT.md` at repo root
- **Timeline markers**: HTML comments as delimiters
- **Evaluation sections**: "What We Learned", "Carry Forward",
  "Changes Outside This Project" as expected headings

## Dependencies

- Node.js (runtime)
- TypeScript (build)
- No external packages
