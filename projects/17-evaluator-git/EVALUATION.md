# Project 17 Evaluation: Evaluator Process Compliance + git Protocol

## Summary

Two advances delivered: the evaluator can now check project
artifacts against process requirements through cascading
references, and a git protocol formalizes version control
operations as mycelium protocol operations.

## Requirements Assessment

### R1: Process compliance checking — PASS
The evaluator's `checkCompliance` function discovers
process/req-*.md files, determines which apply based on
artifact presence (REQUIREMENTS.md, EVALUATION.md, quality
gates), and produces a separate compliance-report.md in
.eval/. Data-triggered: if process/ isn't referenced in,
compliance is silently skipped.

### R2: Process requirements via reference — PASS
Compliance reads req files through mc.data/list on the
project's process/ path. No hardcoded paths to the
top-level process/ folder. Tested: project 16 and 17
both have process/ referenced via .spl/data/refs.json,
and all 5 req files are discoverable through references.

### R3: git/status — PASS
Returns structured `{ files, clean }` with per-file
staged/unstaged status codes. Scoped to a path via
git's `--` separator. Tested with both repo-wide and
path-scoped queries.

### R4: git/checkpoint — PASS
Stage + commit + push as one operation. Returns
`{ checkpoint, hash, path, message }`. Used to commit
the project itself — dogfooded during build.

### R5: git/log — PASS
Returns structured `[{ hash, short, author, date, message }]`
scoped to a path with configurable limit. Uses git's
`--format` for reliable parsing with a separator token.

### R6: git/changelog — PASS
Reverse changelog: reads git log and formats as
human-readable markdown. Scoped to path (tested with
projects/ showing only commits that touched that folder).
Returns string, not a maintained file.

### R7: Tests — PASS
80/80 tests pass. 12 new: 8 git protocol tests (status
structured data, status scoped, log structured, log scoped,
changelog markdown, changelog scoped, checkpoint arg
validation x2) + 4 compliance tests (process ref from
project 16 and 17, req files readable through reference,
all 5 req files present). All 68 existing tests unchanged.

## Quality Gate Evidence

### Pattern gates
- **P1 (Uniform Factory)** — All 4 git operations follow
  `default export async factory(execDoc) → operator`.
  Verified by general suite test "P1: factories return
  operators" (now covers 39 operations).
- **P2 (Config as Indirection)** — 4 config.json files
  in git/{checkpoint,status,log,changelog}/config.json,
  each containing only `{ "module": "..." }`. Verified
  by general suite "P2: config contains only module".
- **P7 (Resolution Through Map)** — Evaluator accesses
  process requirements through `dataList(projectPath +
  '/process')`, which resolves through cascading references.
  No direct filesystem paths.
- **P8 (Internal Efficiency)** — git/lib.js wraps
  `execSync('git ...')` directly. No intermediate
  abstraction over git CLI.

### Functional gates
- [x] Evaluator produces process compliance report
- [x] Process requirements read through cascading references
- [x] git/status returns file status for a path
- [x] git/checkpoint stages, commits, and pushes
- [x] git/log returns structured commit data
- [x] Changelog derives from git log, scoped to path
- [x] All existing tests still pass (68 + 12 = 80)

## Design Decisions

**git/ not mc.git/**: git is an external substrate
protocol, not part of the mycelium data model. Same
category as evaluate/, stats/, context-view/ — tools
that mycelium uses, not core data operations.

**checkpoint not commit**: "commit" overlaps with git's
own terminology and doesn't capture the full operation
(stage + commit + push). "Checkpoint" is a rollback
point — a named moment you can return to.

**Reverse changelog**: Changes happen directly to
resources. The changelog is extracted from git history
afterward, not maintained as a separate file. This
inverts the traditional changelog pattern and eliminates
maintenance overhead.

**Dynamic resources discussed, not built**: The
conversation identified that changelogs should be
mountable as dynamic resources (a file that declares
"generate me using protocol X", interpreted by mc.core/read).
This is a node-type concern, not a separate mechanism.
Deferred to when the first consumer needs it.

## Carry Forward

1. **Dynamic resources in mc.core/read** — A resource
   file that declares a generating protocol. mc.core/read
   detects and delegates. First consumer: changelog as
   mounted resource alongside the data it describes.

2. **Changelog immutability** — Committed history is
   immutable but the "open transaction" (uncommitted
   changes) is mutable. The dynamic resource needs to
   handle both segments.

3. **git/status parsing** — Minor: the porcelain parser
   may need refinement for edge cases (renamed files,
   paths with spaces).

4. **Process compliance feedback loop** — Now that the
   evaluator can check compliance, run it on past projects
   to validate the process requirements themselves. The
   42 requirements need field testing.

## External Changes

- `.spl/proto/evaluate/run.js` — Added `checkCompliance`
  function to existing evaluator pipeline
- `.spl/proto/git/` — New protocol directory with 4
  operators, lib.js, and config.json files
- `.spl/proto/test/suites/git.js` — New test suite
- `.spl/proto/test/suites/compliance.js` — New test suite
