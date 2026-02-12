# Splectrum spl4 — Working Memory

## Repo
- GitHub: splectrum/spl4 (org, not personal)
- Prior iteration: splectrum/spl3 (9 projects, analysis)

## Mission
- spl4 is the integration iteration
- Connect Mycelium model to practical tool use
- Tools consume the context layer
- Stored metadata for self-describing contexts
- Build tools that help with the work

## The Model (proven)
- Record = key → content (opaque bytes)
- Context = container of records (recursive)
- Seven operations: list, read, flatten, create, write, delete, move
- Three layers: logical, capability, physical
- Flat API, metadata-driven behavior, nearest distance
- Changelog as sibling record, three modes
- Mutability is state (metadata), not type
- Atomic tools: proprietary internals, compatible boundaries

## Build Cycle
- AI decides what to build, builds it, evaluates with human
- Projects in `projects/` numbered sequentially
- Write REQUIREMENTS.md before code
- EVALUATION.md captures learnings
- Lightweight principles check at project boundaries
- Automate pre-commit actions (context-view sync etc.)

## Key Constraints
- KISS — simplicity in realization, tweak principles if needed
- Small but meaningful iterations
- Each iteration moves some steps, not the whole distance
- Don't build speculatively — earn features through need

## Process Notes
- Don't modify sealed (previous) projects
- Each project documents external changes it causes
- Immutability is retrospective: moving forward seals what came before
- Corrections/improvements belong to the current project
- Memory lives in .claude/rules/ (in-repo, git-tracked, portable)

## Pillar Structure
- mycelium/ — the data world (model, API, references, layers, tools)
- splectrum/ — the language world (concepts, requirements, quality gates)
- haicc/ — the creative world (build cycle, spawn, evaluator)
- exploratory-repo/ — context type for this kind of repo

## Protocol Architecture (established project 06)

### Stateless protocols
- No factories, no instances, no closures hiding state
- Protocols receive what they need as parameters
- State is explicit and exposed — never hidden

### Session
- root: git repo root, from terminal environment
- cwd: current position relative to root (Mycelium's cd)
- Protocols pick up session context, don't create their own

### Protocol resolution — ancestor chain
- mc.proto.resolve walks current → parent → ... → root
- Nearest distance wins. No separate global/local concept.
- Static = found at current context (code lives here)
- Dynamic = found via ancestor walk (inherited)
- Override by registering closer — shadows ancestor's version
- Protocol executes at its registration context (static loc)
- Forward scope: registration determines data boundary (subtree)

### Scope isolation (critical)
- Every protocol invocation is a scope boundary
- Paths rebased automatically at boundary (both ways)
- Scope switch fully internal, never leaks to caller
- Caller's context unchanged after invocation returns
- mc.xpath must support context-relative paths for rebasing

### Protocol stack (established project 07)
- mc.xpath — resolve paths to Locations (stateless)
- mc.core — five primitives: list, read, create, update, del
  Buffer in/out. The stable contract that doesn't grow.
- mc.raw — delegates to mc.core, adds format layer
  (utf-8, JSON on read; type detection on write).
  Future: compound ops (move, copy). Pre-semantic.
- mc.proto — proper: uses mc.core.read for config resolution
  boot: direct file access, used once at startup

Three layers: primitives (mc.core) → richer structural
(mc.raw) → semantic (mc.data/mc.meta/mc.proto)

### Bootstrap
- spl invoked at repo root, sets SPL_ROOT from git
- Boot mc.proto: the ONE bootstrap protocol, direct file
  access, assumes filesystem + root
- Boot resolves proper mc.proto (one-time), then proper
  mc.proto handles all subsequent resolution
- Boot restrictions don't leak into running system

### spl boundary
- spl validates at boundary, protocols trust internally
- Currently pass-through, validation when capability exists
- Internal concern, no architectural change needed

### Dev vs deployed
- Deployed code in .spl/proto/ (running)
- Dev/reference copies in project src/
- Proper dev envs wait for cascading references + layering

## Deployed Code
- `.spl/proto/mc.proto/boot.js` — boot protocol resolve
- `.spl/proto/mc.proto/resolve.js` — proper resolve (via mc.core)
- `.spl/proto/mc.xpath/resolve.js` — location resolver
- `.spl/proto/mc.core/core.js` — five primitives
- `.spl/proto/mc.raw/raw.js` — format layer on mc.core
- `.spl/spl.mjs` — bootstrap chain logic
- `spl` — bash wrapper (sets SPL_ROOT, exec node)

## Reference Code
- `reference/context-view/` — CONTEXT.md generator (from spl3/05)
- `reference/context-layer/` — flat API, traversal, storage capabilities (from spl3/08)
- `reference/evaluator/` — requirements evaluation pipeline (from spl3/09)

## Carry Forward (from project 07)
- mc.raw compound operations (move, copy)
- Namespace filters (mc.data, mc.meta) on mc.core
- Ancestor chain resolution in mc.proto
- Scope isolation / path rebasing
- Session formalisation (root + cwd as object)
- Protocol config schema
- Documentation consolidation pass (after core bundle complete)
