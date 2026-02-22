# Requirements: REQUIREMENTS.md

What must be true about a valid REQUIREMENTS.md.

## R1: Header
Project number and title. `# Project N: Title`

## R2: Goal
2-4 sentences stating what the project achieves and why.

## R3: Context
Why this project, why now. Enough for an entity not
present in the scoping conversation to understand
motivation.

## R4: Numbered requirements
Each requirement has an R-number (R1, R2, ...). Each
is independently evaluable. Natural language expressing
intent, not implementation detail.

## R5: Requirements are evaluable
Each requirement can be assessed as PASS or FAIL by
looking at the result. Vague requirements ("should be
good") are not valid.

## R6: Quality gates section
Two subsections: pattern gates (referencing P-numbers
from mycelium/patterns.md) and functional gates
(pass/fail assertions specific to this project).

## R7: No unstated assumptions
Each requirement stands alone. An entity can evaluate
it without reading the scoping conversation.

## R8: Use case (when applicable)
A concrete scenario showing how the result is used.
Not mandatory for every project but expected when the
requirements are abstract.
