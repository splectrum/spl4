# Writing Evaluations

How to write EVALUATION.md for a project.

## Purpose

EVALUATION.md records what happened. It assesses the
implementation against its requirements, captures what
was learned, and identifies what comes next. It is
factual — it reports evidence, not aspiration.

## Structure

### Header

    # Project N: Title — Evaluation

### Summary

3-5 sentences. What was built, key metrics (test count,
files changed), significant decisions or patterns
introduced. A reader should know whether the project
succeeded from the summary alone.

### Requirements Assessment

One subsection per requirement:

    ### R1: Title — PASS/FAIL

Brief assessment. What was done to satisfy the
requirement. Reference specific code, files, or test
results as evidence. If a requirement was modified
during build, note the change and why.

Every R-number from REQUIREMENTS.md must appear here.
No silent omissions.

### Quality Gates

Two subsections mirroring REQUIREMENTS.md:

**Pattern gates** — for each referenced pattern, state
PASS and cite the evidence (test name, structural check,
code reference).

**Functional gates** — for each functional gate, state
PASS/FAIL with evidence.

### Deployed

List what was deployed or changed. File paths for new
and modified files. This is the manifest of what the
project produced.

### External Changes

Changes to files outside the project folder. Top-level
docs, memory, deployed code, configuration. These are
side effects of the project that affect the broader
repository.

### Observations

What was learned. This is the most valuable section.
Not a restatement of what was built — that's the
assessment. Observations capture:

- Design insights that emerged during implementation
- Patterns that worked or didn't
- Where the interactive/autonomous boundary was tested
- Surprises, corrections, pivots
- Implications for future work

Both entities contribute observations. The human may
add observations during review.

### Carry Forward

Numbered list of what the next project(s) should
consider. Items discovered during this project that
are out of scope but worth remembering. This feeds
into the "decide" step of the next build cycle.

## Notes

Write the evaluation immediately after completion,
while context is fresh. Don't defer.

The evaluation is not a celebration — it is evidence.
A project can succeed (all requirements met) and still
have critical observations about what should change.
Conversely, a partial success is not a failure if the
evaluation honestly captures what happened and why.
