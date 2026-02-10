# evaluator

## Identity

A Splectrum tool that translates natural language
requirements into evaluation prompts and assembles
results into reports. The first tool that crosses from
Mycelium (data) to Splectrum (meaning) — it interprets.

## Purpose

Automate quality gate evaluation. Read requirements,
collect artifacts, produce structured prompts that any
entity can evaluate, assemble results into a report.
Data-triggered pipeline with stateless steps.

## Operations

Four-step pipeline, each stateless and data-triggered:

1. **prepare** — load artifacts once, parse requirements
2. **translate** — produce per-requirement prompts
3. **evaluate** — execute prompts via capability (manual,
   subagent, claude CLI)
4. **report** — assemble results into report

## Inputs

- A project path containing REQUIREMENTS.md
- Source artifacts in src/ (or other directories)

## Outputs

- Transient context (.eval/) with:
  - `artifacts.md` — all source files
  - `requirements.json` — parsed requirements
  - `R{n}.prompt.md` — per-requirement prompts
  - `R{n}.result.json` — per-requirement results
  - `report.md` — assembled report

## Structural Assumptions

- **Requirements file**: `REQUIREMENTS.md` in project root
- **Source directory**: `src/` in project root
- **Transient context**: `.eval/` in project root
- **Requirement formats**: `### R{n}: {title}` or
  `## {section}` with numbered items
- **Quality gates**: `## Quality Gates` section with
  bullet list (R-numbered format only)
- **Result format**: JSON array of gate results

## Capability Bindings

- **claude CLI**: `claude -p` for automated evaluation
- **subagent**: Task tool within Claude Code session
- **manual**: read prompts, provide results as JSON

## Dependencies

- Node.js (runtime)
- TypeScript (build)
- @types/node (dev)
- No external runtime packages
