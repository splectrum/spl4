# Project 16: Process Standards — Evaluation

## Summary

Four process documents formalized in a top-level process/
folder: build cycle, requirements standard, evaluation
standard, quality gate application. Each document is
actionable — describes how to do the thing, not what the
thing is (that's splectrum/ and haicc/). Project 16
references process/ into its own scope, verified through
tests. 68 tests passing.

Process adoption roadmap captured in splectrum/autonomy.md:
evaluator compliance → convention → protocol. Prompt-driven
approaches (CLAUDE.md pointers) explicitly discarded in
favour of natural flow through structure and incentive.

## Requirements Assessment

### R1: Process folder — PASS
`process/` created at top level with four documents:
build-cycle.md, requirements.md, evaluation.md,
quality-gates.md. Referenceable through cascading
references.

### R2: Build cycle document — PASS
Six steps documented: decide, scope, require, build,
test, evaluate. Each step specifies what it produces,
the interactive/autonomous boundary, inputs, and
completion signal. Principles section captures the
meta-rules (build don't plan, smallest increment,
corrections in current project, cycle improves itself).

### R3: Requirements standard — PASS
Covers: structure (header, goal, context, use case,
R-numbered requirements, phases, quality gates), what
makes a good/bad requirement, the relationship between
requirements and quality gates. Notes that requirements
evolve during build.

### R4: Evaluation standard — PASS
Covers: structure (header, summary, per-requirement
assessment, quality gates, deployed, external changes,
observations, carry forward). Notes on honest reporting,
observations as the most valuable section, writing
immediately while context is fresh.

### R5: Quality gate application — PASS
Covers: two kinds (functional, pattern), how to write
each in REQUIREMENTS.md, how to check them during
evaluation, the test suite as gate evidence, handling
failures honestly.

### R6: Reference into projects — PASS
Project 16 has `.spl/data/refs.json` referencing process/.
Verified by two tests: process/ appears in mc.data/list,
build-cycle.md readable through the reference. Convention
demonstrated — any project can replicate this setup.

### R7: Interactive vs autonomous boundaries — PASS
Each build cycle step in process/build-cycle.md documents
its current boundary:
- Decide: interactive (conversation)
- Scope: interactive (design conversation)
- Require: primarily autonomous (AI writes, human reviews)
- Build: primarily autonomous (AI builds, human intervenes
  on design questions)
- Test: autonomous
- Evaluate: primarily autonomous (AI writes, human reviews)

## Quality Gates

### Pattern gates — all PASS
- P3 (Lib Convention): process docs are documentation,
  not protocol code. No registrations needed.
- P8 (Internal Efficiency): referenced directly through
  cascading references, no protocol round-trip.

### Functional gates — all PASS
- Process folder exists and is referenceable: verified
  by test (e2e: process folder referenced into project 16)
- Each document is self-contained and actionable: each
  doc covers one aspect, readable independently
- Interactive/autonomous boundary explicit per step:
  build-cycle.md marks each step
- At least one project references process docs: project 16
  self-references (verified by test)
- Logical docs not duplicated: process docs reference
  concepts from splectrum/ and haicc/ without restating
  definitions

## Deployed

New:
- `process/build-cycle.md` — build cycle steps
- `process/requirements.md` — how to write requirements
- `process/evaluation.md` — how to write evaluations
- `process/quality-gates.md` — how to apply quality gates
- `projects/16-process-standards/.spl/data/refs.json` —
  self-referential process reference
- `projects/16-process-standards/REQUIREMENTS.md`

## External Changes

- `splectrum/autonomy.md` — process adoption roadmap
  added (evaluator → convention → protocol)

## Observations

### Logical/physical split was the right lens
The existing splectrum/ and haicc/ docs define concepts.
The process/ docs describe practice. Keeping them separate
avoids the trap of conflating "what is evaluation" with
"how to write EVALUATION.md." An agent needs both —
understanding AND procedure — but at different moments.

### Natural flow over enforcement
The discussion about how agents actively use process docs
produced an important insight: structure should make the
right behavior obvious, not commanded. The progression
from evaluator feedback → convention → protocol mirrors
the broader autonomy progression. CLAUDE.md pointers
discarded as prompt-driven.

### Process docs are themselves subject to the cycle
These documents will evolve. The next projects use them,
the evaluator checks against them, observations refine
them. The first version captures current practice — it's
not final.

## Carry Forward

1. Evaluator enhancement: check process compliance
   against process/ standards (adoption roadmap step 1)
2. Convention maturity: naming patterns, structural
   signals that emerge from use (adoption roadmap step 2)
3. mc.git protocol + changelog view
4. mc.raw compound operations (move, copy — git-aware)
5. Stream consumers for execution data
6. Model + spawn protocol (capstone)
