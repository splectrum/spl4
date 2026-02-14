# Project 13: Evaluator Protocol

## Goal

Resurrect the spl3 evaluator as a protocol operation.
Quality gates in operation — evaluate project
requirements against implementation artifacts.

## Design (from spl3)

The evaluator is a data-triggered pipeline. Each step
reads inputs from a transient context (.eval/), writes
outputs. File presence determines what needs to happen.
Stateless — kill and restart at any point.

Four steps:
1. **prepare** — collect artifacts (src/ files), parse
   REQUIREMENTS.md into structured requirements
2. **translate** — generate per-requirement evaluation
   prompts with quality gates
3. **evaluate** — execute prompts via claude CLI, save
   per-requirement results
4. **report** — assemble results into report.md

## Migration

1. TypeScript → JavaScript. No build step, matches
   the rest of the codebase.

2. Direct fs → mc protocols. mc.data for listing
   artifacts, mc.raw for reading content. Imported
   via execDoc.root (async factory pattern).

3. CLI wrapper → factory pattern. evaluate/run takes
   exec doc, returns bound operator.

4. claude CLI invocation with CLAUDECODE env fix
   (delete env.CLAUDECODE before subprocess).

## Operations

5. evaluate/run — full pipeline. Takes a project path,
   runs all four steps in sequence. Skips steps already
   done (data-triggered). Returns the report.

6. evaluate/status — check pipeline state for a project.
   Returns current phase and detail.

## Registration

7. Registered at `/projects` context. Two operations:
   - projects/.spl/proto/evaluate/run/config.json
   - projects/.spl/proto/evaluate/status/config.json

## Transient Context

8. .eval/ directory inside the target project. Contains:
   - artifacts.md — all source files concatenated
   - requirements.json — parsed requirements
   - R{n}.prompt.md — per-requirement prompt
   - R{n}.result.json — per-requirement evaluation
   - report.md — assembled final report

   Delete any file to re-run that step and everything
   after it.

## Requirements Format

9. Two formats supported:
   - R-numbered: `### R{n}: {title}` with `## Quality
     Gates` section
   - Section-based: `## {section}` with numbered items
     as gates (fallback for current project format)

## Constraints

- KISS — direct port from spl3, adapted to protocol
  format. No new features.
- The evaluator is a Splectrum tool — it crosses from
  data (Mycelium) to meaning (Splectrum).
- Transient context (.eval/) is gitignored.
