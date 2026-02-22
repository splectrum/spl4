# Requirements: Build Cycle

What must be true about how a project is executed.

## R1: Decide is interactive
The decision of what to build next is a conversation.
Neither entity decides alone.

## R2: Scope before require
Requirements are written after the scope is clear.
REQUIREMENTS.md is not written speculatively.

## R3: REQUIREMENTS.md before code
Code is written to satisfy requirements, not the other
way around. If requirements change during build, they
are updated first.

## R4: Test after each increment
Each build increment ends with a test run. Untested
code does not accumulate.

## R5: All tests pass before evaluation
The evaluation is written only after all tests pass.
Failing tests are fixed or the requirement is updated.

## R6: Evaluation immediately after completion
EVALUATION.md is written while context is fresh. Not
deferred to a later session.

## R7: Commit includes evaluation
The project commit includes EVALUATION.md. Requirements,
code, and evaluation travel together.

## R8: Build in the open
The agent shows what it's doing during build. Decisions
that aren't obvious are explained. The human can
intervene at any time.

## R9: Corrections in current project
Previous projects are sealed. Corrections and
improvements belong to the current project and are
documented.

## R10: Carry forward feeds decide
The carry forward from evaluation feeds into the
decide step of the next build cycle.
