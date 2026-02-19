# Project 17: Evaluator Process Compliance + git Protocol

## Goal

Two advances: (1) the evaluator checks project artifacts
against process requirements, closing the feedback loop
that makes process standards active; (2) a git protocol
formalizes git operations within mycelium, with changelog
as a reverse-derived view — changes happen to resources
directly, history extracted from git after the fact.

## Context

Project 16 created 42 checkable process requirements but
nothing checks them yet. The evaluator already runs a
pipeline (prepare → translate → evaluate → report) using
Claude to assess project-specific requirements. Extending
it to also check process compliance makes the process
standards structurally active — the natural flow from
the adoption roadmap.

Git operations currently happen ad-hoc through shell
commands. The git protocol makes them protocol operations:
checkpoint bundles stage+commit+push, status is queryable,
history is data. The changelog is the first derived
consumer — instead of maintaining a separate changelog
file, it reads git history for a path and formats it.
This is the "reverse changelog": changes happen to the
resource, the log tells the story afterward.

The git protocol is not under mc.* — it's an external
substrate protocol, like evaluate or stats. Git is a
tool mycelium uses, not part of the data model.

## R1: Process compliance checking

The evaluator gains a process compliance step. For a
given project, it reads the process requirement files
(process/req-*.md) and checks the project's artifacts
against them. Which req files apply depends on what
artifacts exist:

- Project has REQUIREMENTS.md → check against
  req-requirements.md
- Project has EVALUATION.md → check against
  req-evaluation.md
- Project has quality gates → check against
  req-quality-gates.md
- Always → check against req-project.md and
  req-build-cycle.md

The result is a separate compliance report alongside
the existing requirement evaluation.

## R2: Process requirements via reference

The evaluator reads process requirements through
cascading references. If a project has process/ in its
reference scope, the evaluator finds the req-*.md files
there. No hardcoded paths to the top-level process/
folder.

## R3: git/status

What has changed? Returns file status for the repo or
a scoped path — staged, unstaged, untracked files with
their status codes. Needed to know what's ready to
commit and what needs attention.

## R4: git/checkpoint

Stage, commit, and push in one operation. Takes a path
and a commit message. A checkpoint is a rollback point —
a named moment you can return to.

## R5: git/log

History for a path. Returns structured commit data
(hash, author, date, message) scoped to a path — a
file, directory, or the whole repo. This is the
substrate that git/changelog builds on.

## R6: git/changelog

Reverse changelog: given a path, produces a
human-readable markdown changelog by reading git
history. Not a maintained file — a derived view.
Scoped to a path (e.g., a project folder shows only
commits that touched that folder). This replaces
maintaining separate changelog records.

## R7: Tests

- Evaluator process compliance: test with a project
  that has known artifacts, verify compliance report
  structure
- git/status: returns current file status
- git/checkpoint: stages and commits (test in
  isolated context)
- git/log: returns structured entries for known
  commits
- git/changelog: produces markdown for a path

## Quality Gates

### Pattern gates
- P1 (Uniform Factory) — git operations follow
  factory pattern
- P2 (Config as Indirection) — git config.json files
- P7 (Resolution Through Map) — evaluator accesses
  process requirements through resolve
- P8 (Internal Efficiency) — git uses git CLI
  directly (substrate access)

### Functional gates
- Evaluator produces process compliance report
- Process requirements read through cascading references
- git/status returns file status for a path
- git/checkpoint stages, commits, and pushes
- git/log returns structured commit data
- Changelog derives from git log, scoped to path
- All existing tests still pass
