# 03_context_view — Project Context

## Position

Project 03 in spl3 (splectrum/spl3). The first Splectrum
view tool. Built to solve cold-start orientation — any
entity entering the repo gets immediate context.

## Repo

- Repository: splectrum/spl3
- Role: Mycelium boot process
- This tool: generates the repo's self-describing summary

## History

- Built in project 03 (early spl3)
- Requirements in older section-numbered format
- Evaluated retroactively by project 09's evaluator
- All 15 quality gates pass

## Relationships

- **Produces**: CONTEXT.md at repo root
- **Reads**: all project directories, EVALUATION.md files
- **Sibling tool**: evaluator (project 09)
- **Used by**: every entity entering the repo

## Self-Containment Status

Data assets in place:
- TOOL.md — identity and purpose
- context-view.config.md — structural assumptions declared
- REQUIREMENTS.md — quality gates
- EVALUATION.md — learnings
- This file — project context

Not yet done:
- Configuration not loaded from data (still hardcoded)
- No schema validation
- Assumes spl3-specific repo structure
