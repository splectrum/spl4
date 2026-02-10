# 09_evaluator — Requirements

## Purpose

The first Splectrum-layer tool. Takes natural language
requirements and translates them into evaluation prompts.
This crosses the boundary from Mycelium (meaningless
storage) to Splectrum (meaning, expression) — the
evaluator interprets.

Data-triggered pipeline with a transient context:
1. **Prepare** — load artifacts once, parse requirements
2. **Translate** — produce lightweight per-requirement prompts
3. **Evaluate** — execute prompts via a capability (manual,
   subagent, claude CLI)
4. **Report** — assemble results into a report

Each step is stateless. Data state (presence/absence of
files in the transient context) determines what needs to
happen. Kill and restart at any point. Delete a file to
re-run its step.

## Context

Every project has REQUIREMENTS.md with requirements (R1,
R2...) and quality gates. Evaluation has been manual: a
human or AI reads the requirements, reads the code, and
writes EVALUATION.md. This project automates the pipeline
— preparing artifacts, translating requirements into
prompts, and assembling results into a report. Execution
is entity-neutral: a human, an AI session, a subagent, or
the claude CLI can evaluate the prompts.

Mycelium is a data interaction model, not just storage.
The transient context (.eval/) is a short-lived data
context linked to the project. It goes through a process
lifecycle (prepare → translate → evaluate → report) after
which the final result is compacted into the project and
the transient context can be archived or discarded.

## Requirements

### R1: Logical evaluator types

Types that express evaluation without binding to any
implementation:

- `Requirement` — id, title, text, gates (string array)
- `Artifact` — path, content
- `GateResult` — gate, pass (boolean), explanation
- `EvaluationResult` — requirement id, title, gate
  results, overall pass

No imports. Pure data structures. Same pattern as
Mycelium's logical types.

### R2: Requirements parser

Parse a REQUIREMENTS.md file into Requirement objects:

- Requirements identified by `### R{n}: {title}` headings
- Text is everything under the heading until the next
  heading or section boundary
- Quality gates under `## Quality Gates` as bullet list
- Gates associated with requirements by keyword matching
- Output: array of Requirements with text and gates

### R3: Data-triggered pipeline

A transient context (.eval/ directory) where each step
reads inputs and writes outputs as files:

- `artifacts.md` — all source files, loaded once
- `requirements.json` — parsed requirements
- `R{n}.prompt.md` — per-requirement prompt (lightweight,
  contains requirement + gates + instructions only)
- `R{n}.result.json` — per-requirement evaluation result
- `report.md` — assembled final report

Each step checks data state and skips if already done.
Artifacts and prompts are separate files — the executor
combines them at evaluation time. This avoids duplicating
artifacts across prompts.

### R4: Translate step

Produce per-requirement prompts from parsed requirements:

- One prompt file per requirement
- Each prompt contains: requirement text, quality gates,
  and evaluation instructions
- Prompts are lightweight — artifacts are not embedded
- Pure data transformation, no external calls

### R5: CLI

Command-line interface with data-triggered steps:

- `evaluate <project-path>` — run full pipeline
- `evaluate status <project-path>` — show current phase
- `evaluate prepare <project-path>` — load artifacts
- `evaluate translate <project-path>` — generate prompts
- `evaluate run <project-path>` — execute via claude CLI
- `evaluate report <project-path>` — assemble report
- No API key required for prepare, translate, or report
- Each step skips if data state shows it's done

### R6: Self-evaluation

The evaluator must be able to evaluate itself. Running
the pipeline on projects/09_evaluator produces evaluation
prompts for this project against its own requirements.
The recursive proof that the pipeline works.

## Quality Gates

- Logical types have zero imports
- Requirements parser extracts R-numbered requirements
  and quality gates from markdown
- Transient context contains artifacts.md, requirements.json,
  per-requirement prompts, results, and report
- Translate produces one lightweight prompt per requirement
- CLI supports individual steps and full pipeline
- Self-evaluation produces meaningful prompts
