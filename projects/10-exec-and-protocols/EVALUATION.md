# Project 10: mc.exec + Test Protocols — Evaluation

## What Was Built

### Design

**execution.md** — Full execution model design document.
The execution document concept from spl2 (plain data
object carrying all runtime state, outer/inner context
separation, logging as snapshotting) was transferred into
spl4's repository-centred architecture. The spl2 principles
— load state into a doc, process purely on it, snapshot
at boundaries — mapped naturally. What changed is where
state lives: global log at root for lifecycle, local
snapshots at the execution context for full state. The
model starts at phase 1 (create, snapshot start/end,
complete/fail) and iterates to phase 5 (frozen inner
copies, enforced purity) without reworking earlier phases.

**Calling convention and resolution** — A simple, powerful
design for path-based protocol resolution. Every protocol
operation takes a path as first argument. Upward calls
use `.` (own root), downward calls use a forward pointer
that includes the descendant's context root. Resolution
walks the path and checks for .spl/proto/ at each context
boundary — nearest wins. One mechanism handles global
protocols, local protocols, and ancestor chain inheritance.
Compact: a single path addresses locations multiple
protocol scopes deep without the caller needing to know
where boundaries are.

**Execution store architecture** — .spl/exec/ as third
namespace alongside meta/ and proto/. Registration rule
is compile-time: mc protocols never register, all other
state-changing operations always do. Global log is lean
JSONL (suitable for locking), local store holds full
snapshots. Nesting via parent uid references.

### Implementation

**mc.exec** — Execution store protocol. Four operations:
create, snapshot, complete, fail. Direct filesystem
(mc.core lacks append — documented seam). Global log
first (source of truth), then local snapshot.

**stats** — Read-only protocol at root. Collects file
count, line count, byte count via mc.data + mc.raw.
Does not register executions. Validates mc stack for
reading across contexts.

**tidy** — State-changing protocol at projects/. Scans
or cleans transient artifacts (node_modules, dist,
.context-view, .eval) in project instances. Uses mc.exec
for execution registration. Uses mc.data for listing
(automatically excludes .spl). Dynamic imports via
SPL_ROOT for reaching root mc bundles from sub-context.

**Fully qualified protocol paths** — spl.mjs detects `/`
in protocol name → direct config.json read, bypassing
the full bootstrap chain. Enables invoking sub-context
protocols: `spl projects/.spl/proto/tidy scan`.

**mc.data fix** — isSplPath rewritten to check path
segments (`path.split('/').includes('.spl')`) instead of
prefix matching. The old implementation failed for
non-root contexts like `/projects/.spl`.

**projects/ as context** — .spl/ directory with proto/
for tidy registration.

## Key Decisions

**Design weight equals implementation weight.** The
execution model design document is as important as the
running code. It captures the spl2 execution principles
in spl4 terms and provides a clear iteration path. The
code is phase 1; the design covers phases 1–5.

**Path IS the protocol address.** Rather than separate
mechanisms for global vs local protocols, resolution is
a single algorithm: walk the path, check .spl/proto/ at
context boundaries. This emerged from the calling
convention discussion and is both simpler and more
powerful than a dedicated registry lookup.

**Dynamic imports for sub-context protocols.** Protocols
registered below root can't use relative imports to
reach root mc bundles. The SPL_ROOT + pathToFileURL
pattern (same as spl.mjs itself) solves this. It's a
documented interim — proper protocol resolution will
replace it.

**mc.exec uses direct fs.** mc.core doesn't have append.
Rather than extend mc.core for one protocol's needs,
mc.exec uses fs directly. Documented as a seam —
mc.exec lives inside .spl so it's infrastructure, not
user data.

## What We Learned

The spl2 execution model (execution document, outer/inner
context, snapshotting) transferred cleanly into spl4's
very different architecture. The principles are
substrate-independent — they describe how protocol
execution works logically, and the repository-centred
physical layer accommodates them without friction.

The path-based calling convention and resolution algorithm
are a strong result. What started as a practical question
("how does tidy call into project instances?") produced
a universal mechanism. A single path argument serves as
both the target address and the protocol resolution input.
Upward, downward, and cross-scope calls all use the same
convention. The compactness — no explicit scope delimiters
needed — is an emergent property of the design, not
something engineered in.

Two test protocols with different profiles (read-only at
root, state-changing at container) validated distinct
aspects of the stack: mc.data filtering at depth, mc.exec
lifecycle, sub-context protocol registration, and the
fully qualified invocation path.

## Changes Outside This Project

- .spl/proto/mc.exec/ — new protocol (exec.js, config, pkg)
- .spl/proto/stats/ — new protocol (stats.js, cli.js, config, pkg)
- .spl/proto/mc.data/data.js — isSplPath fix for non-root
- .spl/spl.mjs — fully qualified protocol path support
- .gitignore — .spl/exec/ exclusions
- projects/.spl/ — new context with proto/tidy/
- mycelium/execution.md — new design document
- mycelium/protocols.md — calling convention, resolution
  algorithm, execution store sections
- mycelium/vocabulary.md — execution document term
- mycelium/diagrams.md — execution store diagram updates

## Carry Forward

- Ancestor chain resolution (project 11)
- Scope isolation + path rebasing (project 12)
- Evaluator protocol (project 13)
- Replace dynamic imports with proper protocol resolution
- mc.core append operation (remove mc.exec fs seam)
- Update CONTEXT.md via context-view sync
