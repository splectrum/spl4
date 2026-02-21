# spl4 Critical Review

## Mission

spl4 is the integration iteration. Its mission: connect
the Mycelium model to practical tool use. Tools consume
the context layer, contexts describe themselves through
stored metadata, and the three concerns (defining meaning,
created meaning, capabilities) are structurally
distinguishable.

## Verdict

Mission achieved. The protocol stack is proven, self-hosting,
and pattern-verified. 18 projects moved from scaffolding
through core protocols to a mature, tested system. The gap
between abstract concepts and running code — identified as
the primary problem in project 9 — is closed.

## What Was Built

18 sequential projects producing:
- 37 registered operations across 13 protocols
- 89 tests, all passing
- 8 mandatory implementation patterns (P1-P8)
- Cascading references with copy-on-write
- Process standards with evaluator compliance
- Git protocol with AI-assisted checkpoint
- Self-hosting: tools built in spl4 helped build spl4

### Project Arc

| Phase | Projects | Achievement |
|-------|----------|-------------|
| Foundation | 1-5 | Repo structure, pillar dirs, context-view, metadata, spl runner |
| Core protocols | 6-9 | Bootstrap chain, mc.core, mc.raw, mc.data/meta, dogfood |
| Resolution | 10-13 | mc.exec, proto map, spl as protocol, evaluator |
| Maturation | 14-18 | Uniform factory, cascading refs, process, git, compound ops |

## Architecture Decisions That Proved Themselves

**Stateless protocols + exec doc.** No hidden state,
everything explicit. Survived 18 projects without rework.
The exec doc carries root, map, prefix, resolvePath,
resolve — all a protocol needs.

**Uniform factory (P1).** Every operation: async
factory(execDoc) returns operator. Enables mechanical
verification. No exceptions were needed across 37
operations.

**Map-based resolution.** Longest prefix match gives
project-scoped overrides for free. Bootstrap has one seam
(mc.proto/map imported directly); everything else resolves
through the map.

**Cascading references.** Read-only overlay + copy-on-write.
Solved process standards visibility, hidden contexts,
and structural access control in one mechanism.

**Three channels (P4).** Data state (mycelium), execution
state (exec doc + faf), realtime state (stdout/stderr).
Never conflated across 18 projects.

**Config as indirection (P2).** config.json has only the
module path. Registration is filesystem structure. Adding
an operation = adding a directory with config.json + module.

**Point of view (P6).** Resources CWD-relative, functionality
root-relative. Resolved the "where am I?" ambiguity that
plagued earlier iterations.

## What Didn't Fully Land

**Evaluator intelligence.** Haiku calls fail ~2/9 times.
The pipeline (prepare, translate, evaluate, report) works,
but the AI step is brittle. Retry helps; doesn't solve.

**Stream consumers.** Scoped but never needed. No pressing
use case emerged. Correctly postponed.

**Changelog --follow.** Design question unresolved: does
changelog belong to resource or path? Infrastructure
supports either choice.

**Dynamic resources.** Discussed (mc.core/read detects
"generate me" directives), not built. Premature — needs
the discover protocol.

**Memory scale.** memory.md grew to 234 lines as the
system grew. The cascading references principle (detail
on demand) could help, but the mechanism isn't in place
for memory itself.

## Autonomy Gap

### Where the system worked autonomously

- Pattern application — once P1-P8 documented, mechanical
  to apply across all operations
- Test writing and running — harness + suites self-sufficient
- Protocol resolution and composition — map does the work
- Process compliance — evaluator reads standards through
  references, checks against artifacts

### Where human intervention was still needed

- Principle-to-pattern translation — creative resolution
  when principles conflict
- Scope decisions — what to build, when to stop, when
  something is premature
- Design questions — naming, staging scope, changelog
  ownership. Meaning decisions.
- Quality judgment — evaluator checks structure, human
  checks substance

### Progression

The gap narrowed. Projects 14-18 needed less intervention
than 1-9. Patterns + process + evaluator compound.

## Thinking Captured, Not Built

**Discover protocol** (mycelium/discover.md). Semantic
layer — produces efficient data blocks for agent consumption.
Needs mountable dev environments. Seed captured.

**Dynamic resources.** A resource declares "generate me
using protocol X." Concern for mc.core/read. Related to
discover but distinct.

**Focus over efficiency.** Tailoring context to task is a
meaning concern. The smallest context and cheapest run are
consequences of getting the meaning right, not objectives.

## Protocol Inventory

### Infrastructure (mc.*)
- mc.proto (1 op) — resolution
- mc.xpath (1 op) — location resolution, layers, bucket
- mc.core (5 ops) — list, read, create, update, del
- mc.raw (7 ops) — format layer + move, copy
- mc.data (5 ops) — user data view
- mc.meta (5 ops) — metadata view
- mc.exec (4 ops) — execution state

### Tool
- git (4 ops) — status, checkpoint, log, changelog
- evaluate (2 ops, project-scoped) — run, status
- test (1 op) — suite runner
- stats (1 op) — context statistics
- context-view (2 ops) — scan, sync

### Bootstrap
- spl (1 op) — init (proto map rebuild)
- tidy (2 ops, project-scoped) — scan, clean

## spl5 Scope

1. Spawn: model/ as subrepo dev environment, export
   packaging, deploy to independent repo
2. Protocol dev environments: develop and test protocols
   in isolation before deploying
3. Discover protocol: semantic layer for producing
   efficient data blocks (once dev environments exist)
4. Candidate development: model/ inside parent, parent
   tooling shapes candidate, deploy makes it autonomous
5. Repo diversification: splectrum hub + focused repos
