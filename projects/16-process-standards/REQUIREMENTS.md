# Project 16: Process Standards

## Goal

Formalize the build cycle into referenceable process docs.
The logical definitions already exist (splectrum/, haicc/).
This project creates the physical counterpart — the
actionable process that agents follow when executing the
build cycle.

The result: a top-level folder that projects reference in.
An agent working in project scope sees how to write
requirements, how to evaluate, how the build cycle flows,
what quality gates look like — through cascading references,
not through prompts.

## Context

The logical/physical division applies to process itself:

**Logical** (exists): what requirements ARE, what evaluation
IS, what quality gates ARE. Lives in splectrum/ and haicc/.
These are definitions — stable, pillar-level.

**Physical** (this project): how to write a REQUIREMENTS.md,
what sections an EVALUATION.md contains, the steps of the
build cycle, how to apply quality gates. These are process
— actionable, referenceable.

The disentanglement: logical docs define meaning. Physical
docs define process. An agent needs both but uses them
differently — logical for understanding, physical for doing.

Interactive vs autonomous: the process docs should make
clear which steps are autonomous (agent proceeds) and
which are interactive (agent consults human). The boundary
isn't fixed — it shifts as patterns accumulate — but the
current boundary should be explicit.

## R1: Process folder

A top-level `process/` folder containing actionable process
documents. Each document covers one aspect of the build
cycle. The folder is referenceable — projects bring it
into scope through cascading references.

## R2: Build cycle document

The build cycle as a sequence of steps. For each step:
what it produces, who drives it (autonomous/interactive),
what inputs it needs, what signals completion. Covers:
decide → scope → require → build → test → evaluate.

## R3: Requirements standard

How to write REQUIREMENTS.md. Sections, R-numbered format,
the relationship between requirements and quality gates,
use case inclusion, implementation phases. Derived from
what we've practiced in projects 14 and 15.

## R4: Evaluation standard

How to write EVALUATION.md. Sections, per-requirement
assessment, quality gate verification, observations,
carry forward. Derived from practice.

## R5: Quality gate application

How to apply quality gates in practice. The two kinds
(functional, pattern), how pattern gates reference
mycelium/patterns.md, how to write gates in requirements,
how the evaluator checks them.

## R6: Reference into projects

Each project gets process docs through cascading references.
Demonstrate by referencing process/ into project 16 itself
(self-referential dogfood). Document the convention for
how projects set up their references.

## R7: Interactive vs autonomous boundaries

Each process step documents the current boundary between
autonomous and interactive. This is descriptive (what the
boundary IS today), not prescriptive (what it should be).
The boundary shifts as patterns and evidence accumulate.

## Quality Gates

### Pattern gates
- P3 (Lib Convention) — process docs are not protocol code
- P8 (Internal Efficiency) — referenced directly, no
  protocol round-trip

### Functional gates
- Process folder exists and is referenceable
- Each document is self-contained and actionable
- Interactive/autonomous boundary is explicit per step
- At least one project references process docs (self-ref)
- Logical docs (splectrum/, haicc/) not duplicated
