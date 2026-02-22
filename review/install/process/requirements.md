# Writing Requirements

How to write REQUIREMENTS.md for a project.

## Purpose

REQUIREMENTS.md translates scoped intent into something
buildable and evaluable. It is the contract between the
scoping conversation and the implementation.

## Structure

### Header

Project number and title. One line.

    # Project N: Title

### Goal

2-4 sentences. What the project achieves and why it
matters. Not how — the how comes in the requirements.

### Context

Why this project, why now. What it builds on, what it
enables. Brief — enough context for an entity that
wasn't in the scoping conversation to understand the
motivation.

### Use case (when applicable)

A concrete example showing how the result is used.
Not every project needs one, but most benefit from it.
Use cases ground abstract requirements in reality. Show
the scenario, not just the mechanism.

### Requirements (R1, R2, ...)

Numbered requirements. Each R-number is independently
evaluable. Write in natural language — express intent,
not implementation detail.

A good requirement:
- States what, not how (unless the how IS the requirement)
- Is evaluable — you can look at the result and say
  pass or fail
- Is scoped — it doesn't try to cover everything
- Stands alone — another entity can evaluate it without
  reading the whole conversation

A bad requirement:
- Describes implementation steps (that's a plan, not a
  requirement)
- Is too vague to evaluate ("should be good")
- Depends on unstated assumptions
- Bundles multiple concerns into one R-number

### Implementation phases (when applicable)

For complex projects, break the build into phases. Each
phase ends with a test checkpoint. Phases are guidance
for the build step, not requirements themselves.

### Quality gates

Two sections:

**Pattern gates** — which implementation patterns (from
mycelium/patterns.md) apply. Reference by P-number.
See `quality-gates.md` for how to apply them.

**Functional gates** — checkable assertions specific to
this project. Derived from the requirements but phrased
as pass/fail checks.

## Notes

Requirements evolve during the build. If implementation
reveals that a requirement is wrong or incomplete, update
it. The final REQUIREMENTS.md should match what was
actually built, not what was initially imagined.

The scoping conversation may produce requirements
directly — the human often states what they want in
terms that are already requirements. Capture these
faithfully. Don't rephrase intent into something the
human didn't mean.
