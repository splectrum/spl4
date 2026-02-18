# Build Cycle

The build cycle is how work moves from idea to completed
project. Each step produces something concrete. The cycle
repeats per project.

## Steps

### 1. Decide

**What:** Choose the next project. Consider the scope
(what's agreed for this iteration), the carry forward
(what the last project identified), and what would be
most useful right now.

**Produces:** A project number and working title.

**Boundary:** Interactive. The decision is a conversation.
AI proposes based on scope and evidence. Human confirms,
redirects, or suggests alternatives. Neither entity
decides alone — the decision emerges from discussion.

**Completion:** Both entities agree on what to build next.

### 2. Scope

**What:** Define what the project covers and where its
edges are. What's in, what's out, what's deferred. Discuss
the approach — high-level structure, key design decisions,
trade-offs.

**Produces:** A clear understanding of project boundaries.
This understanding feeds directly into requirements. It
may also produce updates to top-level documentation
(principles, positioning) if the discussion reveals
something worth capturing.

**Boundary:** Interactive. Scoping is a design conversation.
AI explores technical implications, proposes structure.
Human provides intent, constraints, corrections. The user
may have specific ideas about how something should work —
these override AI assumptions.

**Completion:** Scope is clear enough to write requirements.

### 3. Require

**What:** Write REQUIREMENTS.md. Translate the scoped
intent into numbered requirements with quality gates.
See `requirements.md` for format.

**Produces:** REQUIREMENTS.md in the project folder.

**Boundary:** Primarily autonomous. AI writes requirements
based on the scoping discussion. Human reviews and
corrects. Corrections are typically about intent (AI
misunderstood what was meant) or scope (too much or too
little). The format itself is mechanical.

**Completion:** REQUIREMENTS.md written and accepted.

### 4. Build

**What:** Implement the requirements. Build incrementally
— phase by phase if the requirements define phases,
otherwise smallest testable increments. Test after each
increment.

**Produces:** Working code, deployed to `.spl/proto/` or
appropriate location.

**Boundary:** Primarily autonomous. AI builds, tests,
fixes. Human intervenes when:
- The implementation reveals a design question not
  covered by requirements
- A pattern violation is spotted
- The approach needs correction

Build in the open — show what you're doing, explain
decisions that aren't obvious. Don't go silent for long
stretches. The human may interrupt with corrections or
better approaches at any time.

**Completion:** All requirements implemented, all tests
passing.

### 5. Test

**What:** Verify the implementation through the test
harness. Tests are written alongside code during the
build step, not as a separate phase. This step is about
the final verification run and any integration testing.

**Produces:** All tests passing. Test count reported.

**Boundary:** Autonomous. Run `spl test run`, fix failures,
re-run. If a failure reveals a design issue (not just a
bug), escalate to the human.

**Completion:** All tests pass on consecutive runs
(idempotent).

### 6. Evaluate

**What:** Write EVALUATION.md. Assess each requirement,
verify quality gates, capture observations, identify
carry forward. See `evaluation.md` for format.

**Produces:** EVALUATION.md in the project folder.

**Boundary:** Primarily autonomous. AI writes the
evaluation based on evidence (test results, code review,
requirement assessment). Human reviews. The evaluation
is factual — it reports what happened, not what was hoped.

Observations are where learning happens. Both entities
may contribute observations. Carry forward captures what
the next project should consider.

**Completion:** EVALUATION.md written, project committed.

## Principles

**Build, don't plan endlessly.** If it's wrong, fix it.
Planning beyond what's needed for the current step wastes
effort on assumptions.

**Smallest useful increment.** Each build step should
produce something testable. Don't accumulate untested
work.

**Corrections belong to the current project.** Previous
projects are sealed. If something needs fixing, fix it
now and document the change.

**The cycle improves itself.** Observations from
evaluation feed back into how the cycle works. Process
standards evolve through use, not through planning.
