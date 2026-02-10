# 09_evaluator — Project Context

## Position

Project 09 in spl3 (splectrum/spl3). The first
Splectrum-layer tool — crosses from Mycelium (data)
to Splectrum (meaning). Interprets requirements and
evaluates artifacts against them.

## Repo

- Repository: splectrum/spl3
- Role: Mycelium boot process
- This tool: evaluates projects against their requirements

## History

- Built in project 09 (late spl3)
- Evolved through conversation: self-contained prompts →
  two-step translate/execute → data-triggered pipeline
- Key insights emerged during build: data-triggered
  processing, transient contexts, explicit/implicit
  boundary, tailored data environments
- Self-evaluated successfully
- Retroactively evaluated projects 03-08

## Relationships

- **Reads**: REQUIREMENTS.md, src/ artifacts from any project
- **Produces**: .eval/ transient context with prompts, results, report
- **Sibling tool**: context-view (project 03)
- **Used by**: any entity evaluating project quality

## Self-Containment Status

Data assets in place:
- TOOL.md — identity and purpose
- evaluator.config.md — structural assumptions and schemas declared
- REQUIREMENTS.md — quality gates (R-numbered format)
- EVALUATION.md — learnings
- This file — project context

Not yet done:
- Configuration not loaded from data (still hardcoded)
- No schema validation
- Result enrichment (operator metadata, timestamps, provenance)
- Namespaced metadata on outputs
- Format self-declaration in requirements files
