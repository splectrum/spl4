# Project 18: Compound Operations + Changelog

## Goal

Two advances: (1) mc.raw gains move and copy — compound
operations built from primitives, git-aware so history
travels with the resource; (2) the changelog model meets
reality through worked examples using git/changelog,
showing the reverse changelog pattern (resource-first)
in practice.

## Context

The data API defines seven operations: list, read,
flatten, create, write, delete, move. Five primitives
are implemented (list, read, create, update, del). Move
is planned but not built. Copy is a natural companion —
create from an existing resource.

These are compound because they compose primitives:
move = read + create + del. Copy = read + create. But
at the git level, move is `git mv` — a single operation
that preserves history. Git-awareness means the compound
operation uses the most efficient substrate action (P8).

The model defines changelog as a sibling record with
three modes (none, resource-first, log-first). Project
17 built git/changelog as a derived view over git
history. This project connects them: perform operations,
see the changelog tell the story. Resource-first mode
is what we have — the resource is truth, git history
is the audit trail.

## R1: mc.raw/move

Move a resource from one path to another. Uses `git mv`
under the hood so history follows the file. Works for
files. Rejects moves across context boundaries that
would break references.

## R2: mc.raw/copy

Copy a resource to a new path. The copy is a new
resource — git history for the copy starts from the
copy point. The original retains its full history.
Works for files.

## R3: Git-aware operations

Move uses `git mv`. Copy uses read + create + `git add`.
Both operations stage their changes so a subsequent
git/checkpoint captures them. The git substrate is
used directly (P8), not through mc.core primitives.

## R4: Changelog after move

After a move, git/changelog on the new path shows
history from before the move. Git's rename tracking
(`--follow`) makes this work. The changelog follows
the resource, not the path.

## R5: Changelog after copy

After a copy, git/changelog on the copy shows history
starting from the copy point. The original's changelog
is unaffected. The copy is a new resource with its own
history going forward.

## R6: Changelog examples

Worked examples demonstrating the resource-first
changelog pattern:
- Changelog for a file that has been moved
- Changelog for a project directory (aggregated)
- Changelog scoped to a specific path showing only
  relevant commits

These are not new code — they exercise git/changelog
with real data to validate the pattern.

## R7: Tests

- mc.raw/move: moves file, original gone, new path
  readable, content preserved
- mc.raw/copy: copies file, both paths readable,
  content identical
- Move is git-aware: moved file is staged
- Copy is git-aware: copied file is staged
- Changelog after move shows pre-move history
- All existing tests still pass

## Quality Gates

### Pattern gates
- P1 (Uniform Factory) — move and copy follow factory
- P2 (Config as Indirection) — config.json files
- P8 (Internal Efficiency) — git mv / git add used
  directly, not through mc.core

### Functional gates
- mc.raw/move moves a file with git history preserved
- mc.raw/copy creates an independent copy
- Moved file is staged for git/checkpoint
- Copied file is staged for git/checkpoint
- git/changelog --follow shows history across renames
- All existing tests still pass
