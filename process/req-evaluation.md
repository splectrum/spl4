# Requirements: EVALUATION.md

What must be true about a valid EVALUATION.md.

## R1: Header
Project number, title, and "Evaluation" label.

## R2: Summary
3-5 sentences. Key metrics (test count, files changed).
A reader knows whether the project succeeded from the
summary alone.

## R3: Every R-number assessed
Each R-number from REQUIREMENTS.md appears as a
subsection with PASS or FAIL and evidence. No silent
omissions.

## R4: Evidence-based assessment
Each requirement assessment cites specific evidence:
test names, file paths, code references, test counts.
"It works" is not evidence.

## R5: Quality gates verified
Pattern gates and functional gates from REQUIREMENTS.md
each verified with evidence. Same two-subsection
structure.

## R6: Deployed section
Lists new and modified files. The manifest of what the
project produced.

## R7: External changes section
Changes to files outside the project folder. Side
effects on the broader repository.

## R8: Observations section
What was learned. Not a restatement of the assessment.
Design insights, pattern observations, boundary
observations, surprises. Both entities may contribute.

## R9: Carry forward section
Numbered list of items for future projects. Discovered
during this project, out of scope, worth remembering.

## R10: Written immediately
The evaluation is written while context is fresh, not
deferred.
