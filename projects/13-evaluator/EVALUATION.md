# Project 13: Evaluator Protocol — Evaluation

## Summary

Quality gate evaluation is operational. The evaluator
runs as a protocol operation (evaluate/run, evaluate/status),
executes a four-step data-triggered pipeline, and produces
structured evaluation reports.

First live run on project 12: 5 of 7 PASS, 2 FAIL.
One FAIL was a genuinely correct assessment (S4 — protocol
operations don't use doc.map for resolution). One FAIL was
a transient parse error from haiku (S5).

This project also established the Point of View (POV)
principle: resources are relative to CWD, functionality
is root-relative. `doc.resolvePath` enforces the boundary.

## Requirements Assessment

### R1: Design (from spl3) — PASS
Four-step data-triggered pipeline implemented exactly as
specified: prepare → translate → evaluate → report. File
presence determines what steps need running. Stateless and
resumable — delete any intermediate file to re-run from
that point.

### R2: Migration — PASS
- TypeScript → JavaScript: done, no build step
- Direct fs → mc protocols: data.list, raw.read, core.create
- CLI wrapper → factory pattern: run(execDoc) and status(execDoc)
- CLAUDECODE env fix: delete env.CLAUDECODE before subprocess

### R3: Operations — PASS
Two operations registered at `/projects` context:
- evaluate/run — full pipeline, returns report
- evaluate/status — check phase, returns phase + detail

Registration at `projects/.spl/proto/evaluate/` (not root).

### R4: Transient Context — PASS
.eval/ directory inside target project. Contains:
- artifacts.md, requirements.json (prepare)
- {id}.prompt.md (translate)
- {id}.result.json (evaluate)
- report.md (report)

.eval/ added to .gitignore.

### R5: Requirements Format — PASS
Two formats working:
- R-numbered: `### R{n}: {title}` with quality gates section
- Section-based: `## {section}` with numbered items as gates

### R6: Constraints — PASS
Direct port from spl3, adapted to protocol format. No new
features added. Async factory pattern matches all other
protocol operations.

## Emergent: Point of View Principle

Building the evaluator surfaced a fundamental principle
about paths, access, and identity.

### The principle
- **Resources** are relative to POV (CWD). You can only
  see what is in front of you, never behind.
- **Functionality** (operations, modules) is root-relative
  and always available regardless of POV.
- **Paths are context-relative PKs** — the same resource
  has different identities from different viewpoints.
  Scalable URI-based primary keys.
- **Cascading references** bring out-of-view data into
  view. Base level of permission: no reference, no access.
- Resources can have **multiple UUIDs** tied to different
  contexts.

### Implementation
- `doc.prefix` — POV as CWD relative to root (`.` at root)
- `doc.resolvePath(path)` — resolves CWD-relative path to
  absolute mc path, rejects paths that escape above POV
- No conditionals — prefix always applied via `path.join`,
  `.` normalizes away at root
- Operator results use the input path (POV-relative), not
  the resolved absolute path
- `spl` wrapper made global (`.bashrc` PATH update)

### Design decision: minimize conditionals
Set data appropriately so code paths are uniform. Example:
prefix is `.` at root, not empty string. `join('.', x)` = `x`.
One code path for all cases.

## Observations

### The evaluator works
S4's FAIL on project 12 was correct — it identified that
protocol operations use direct pathToFileURL imports to mc
modules rather than resolving through doc.map. This is a
genuine architectural gap in project 12's implementation
relative to its requirements. The evaluator caught it.

### Parser limitation
The section-based parser captures only the first line of
multi-line numbered items as gate text. The full content
is still in the requirement body (and therefore in the
prompt), so the evaluator has the context. The gates are
just truncated labels. Minor — not worth fixing now.

### Haiku reliability
Two in nine evaluations (across two runs) produced
unparseable responses. The evaluator handles this
gracefully — returns FAIL with "Failed to parse response".
Re-running evaluate on the same project will re-evaluate
only failed/missing results (data-triggered).

## Deployed

- `.spl/proto/evaluate/evaluator.js`
- `.spl/proto/evaluate/parser.js`
- `projects/.spl/proto/evaluate/run/config.json`
- `projects/.spl/proto/evaluate/status/config.json`

Total operations: 8 (spl/init, stats/collect, tidy/scan,
tidy/clean, context-view/sync, context-view/scan,
evaluate/run, evaluate/status).

## External Changes

- `.gitignore` — added `**/.eval/`
- `.bashrc` — PATH updated from spl2 to spl4
- `.spl/spl.mjs` — added `doc.prefix` and `doc.resolvePath`
- `mycelium/model.md` — new Point of View section
- `PRINCIPLES.md` — POV added to behavioral principles (1.6)

## Carry Forward

1. Protocol resolution through doc.map (identified by
   evaluator on project 12 — operations hardcode mc
   module paths instead of resolving through map)
2. Cascading references (horizontal) and layering (vertical)
3. Multiple UUID identity per resource
4. Reference-based permission model
5. Retry on haiku parse failure (optional, low priority)
6. Multi-line gate parsing (cosmetic, low priority)
