# Project 18: Compound Operations — Evaluation

## Summary

mc.raw gains move and copy as compound operations built
from primitives, both git-aware. The changelog examples
exercise git/changelog against real project data and
validate the resource-first pattern.

## Requirements Assessment

### R1: mc.raw/move — Met

Move relocates a file using `git mv`. Validates source
is a file, rejects references (can't move what you don't
own), resolves destination parent. Handles untracked
files by staging before `git mv`.

### R2: mc.raw/copy — Met

Copy reads source through mc.core/read (works through
references — read is always allowed), creates at
destination via mc.core/create, stages with `git add`.
The copy is a new resource with history starting from
the copy point.

### R3: Git-aware operations — Met

Move uses `git mv` directly. Copy uses `git add` after
create. Both stage changes for git/checkpoint. The git
substrate is used directly — not routed through mc.core
for the git operations themselves.

### R4: Changelog after move — Open

The requirement specified `--follow` for rename tracking.
This was implemented then consciously reverted. Without
`--follow`, git/changelog tracks the path, not the
resource — after a move, changelog on the new path
shows only post-move history.

This is an open design decision. The question: does the
changelog belong to the resource (follows it on move)
or the path (stays put)? In the model, changelog is a
sibling — it attaches to a resource, not a location.
This argues for `--follow`. But `--follow` only works
for single files (not directories) and adds complexity
to a simple operation.

Deferring to future discussion. The infrastructure
supports either choice — it's a one-line change to
git/log and git/changelog.

### R5: Changelog after copy — Met

After copy, the new resource has its own history
starting from the copy point. The original's history
is unaffected. This works by nature — git tracks the
copy as a new file.

### R6: Changelog examples — Met (via tests)

The compound test suite exercises git/changelog on
real project data (`projects/`), verifying it produces
markdown with heading and entries. This validates the
resource-first pattern: resources are modified directly,
changelog extracts the story from git afterward.

### R7: Tests — Met

89/89 tests pass. Compound suite covers: setup, copy
(content + git staging), move (content + git staging +
original removed), reference handling (move rejects,
copy works through), changelog on real data, teardown.

## Pattern Gate Assessment

- **P1 (Uniform Factory):** Both move and copy follow
  the factory pattern — async factory(execDoc) returns
  async operator.

- **P2 (Config as Indirection):** Both have config.json
  with only `{ "module": "..." }`.

- **P7 (Resolution):** move resolves mc.xpath/resolve
  through execDoc.resolve. copy resolves mc.core/read
  and mc.core/create through execDoc.resolve.

- **P8 (Internal Efficiency):** move uses `git mv`
  directly. copy uses `git add` directly. Neither
  routes git operations through mc.core.

## Observations

**Untracked file handling.** `git mv` requires the
source to be under version control. Files created by
mc.raw/create are untracked until explicitly staged.
The fix: move checks tracking status and stages if
needed before `git mv`. This is pragmatic — every
movable resource should be under version control.

**Copy through references.** copy uses mc.core/read
which follows references, so copying from a referenced
source works naturally. move rejects references — you
can't relocate something you don't own.

**Asymmetry is correct.** copy is permissive (read
anything, create locally), move is restrictive (local
resources only). This aligns with the model: references
are read-only views, copy-on-write creates local
resources, move is ownership transfer.

## What's Next

The `--follow` question for R4 needs resolution as
part of the broader changelog model. The infrastructure
is in place — the decision is about meaning: does a
changelog belong to a resource or a path?
