# Requirements: Quality Gates

What must be true about quality gates in a project.

## R1: Two kinds
Quality gates are separated into pattern gates and
functional gates. Both must be present in REQUIREMENTS.md.

## R2: Pattern gates reference P-numbers
Each pattern gate references a named pattern from
mycelium/patterns.md by P-number. Only patterns that
apply to this project are listed.

## R3: Functional gates are pass/fail
Each functional gate is a checkable assertion. It can
be verified as PASS or FAIL by examining the result.
No vague gates.

## R4: Gates derive from requirements
Quality gates are not separate from requirements. They
are requirements made precise enough to check. Every
gate should trace to one or more R-numbers.

## R5: Evidence at evaluation
Each gate in the evaluation cites specific evidence:
test name, code reference, structural check. The
evaluator can verify independently.

## R6: Test suite as evidence
Where possible, gates are verified by the test suite.
Tests that verify patterns (general suite) provide
pattern gate evidence. Tests that verify behavior
provide functional gate evidence.

## R7: Failures reported honestly
A failing gate is recorded as FAIL with explanation.
Not hidden, not forced to pass. The evaluation captures
what happened.
