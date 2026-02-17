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
- Seven operations: list, read, create, update, del (+ flatten, move planned)
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

## Protocol Architecture (current as of project 14)

### Boot sequence (spl.mjs)
- Bash wrapper `spl` discovers root via `git rev-parse --show-toplevel`
- Builds seed doc: `{"root":"...","argv":[...]}`, passes as JSON arg
- spl.mjs parses seed, boots mc.proto/map, mc.exec, mc.proto/resolve
- No env vars — everything from seed doc

### Uniform factory pattern (P1)
- Every registered operation: default export async factory(execDoc) → operator
- config.json: `{ "module": "..." }` — only module path, nothing else
- Boot creates exec doc, attaches map + prefix + resolvePath + resolve
- Shared protocol internals in lib.js (not registered)

### Exec doc (static data state)
- doc.root — repo root (enumerable)
- doc.map — proto map (non-enumerable, invisible to faf)
- doc.prefix — CWD relative to root (non-enumerable)
- doc.resolvePath — CWD-relative → absolute mc path (non-enumerable)
- doc.resolve — mc.proto/resolve operator (non-enumerable)

### Three channels (P4)
- Data state: mycelium (mc.core/mc.data/mc.raw/mc.meta)
- Execution state: exec doc + faf (mc.exec)
- Realtime state: stdout/stderr captured by boot

### Protocol stack
- mc.proto — resolve (map-based protocol resolution)
- mc.xpath — resolve paths to Locations
- mc.core — five primitives (list, read, create, update, del)
- mc.raw — format layer on mc.core (pre-semantic)
- mc.data — user data view (.spl filtered)
- mc.meta — metadata view (.spl/meta/ scoped)
- mc.exec — execution state (create, drop, complete, fail)

### Registration
- .spl/proto/<protocol>/<operation>/config.json
- Proto map: protocol/operation → context + config
- Longest prefix match for multiple registrations
- Bootstrap: spl/init imports mc.proto/map directly (can't resolve itself)
- Bootstrap: spl.mjs imports mc.proto/resolve directly (attaches to doc)

### Dev vs deployed
- Deployed code in .spl/proto/ (running)
- Dev/reference copies in project src/

## Deployed Code
- `spl` — bash wrapper (discovers root via git, seed doc as JSON arg)
- `.spl/spl.mjs` — boot entry point (parses seed, no env vars)
- `.spl/proto/mc.proto/map.js` — proto map builder/resolver
- `.spl/proto/mc.proto/resolve.js` — protocol resolution operator
- `.spl/proto/mc.xpath/resolve.js` — location resolver
- `.spl/proto/mc.core/{list,read,create,update,del}.js` — five primitives
- `.spl/proto/mc.raw/{list,read,create,update,del}.js` — format layer
- `.spl/proto/mc.data/{list,read,create,update,del}.js` — user data view
- `.spl/proto/mc.meta/{list,read,create,update,del}.js` — metadata view
- `.spl/proto/mc.exec/{lib,create,drop,complete,fail}.js` — execution state
- `.spl/proto/spl/init.js` — proto map rebuild
- `.spl/proto/stats/collect.js` — context statistics
- `.spl/proto/context-view/{lib,sync,scan}.js` — CONTEXT.md generator
- `.spl/proto/evaluate/{lib,run,status,parser}.js` — quality gate evaluator
- `.spl/proto/test/{lib,run}.js` + suites/ — test harness + library
- `projects/.spl/proto/evaluate/{run,status}/config.json` — project-scoped
- `projects/.spl/proto/tidy/{lib,scan,clean}.js` — transient cleanup

## Reference Code
- `reference/context-view/` — CONTEXT.md generator (from spl3/05)
- `reference/context-layer/` — flat API, traversal, storage capabilities (from spl3/08)
- `reference/evaluator/` — requirements evaluation pipeline (from spl3/09)

## Evaluator Protocol
- evaluate/run — full pipeline with haiku retry (callClaude/tryCallClaude)
- evaluate/status — check pipeline phase
- Data-triggered: file presence determines what steps run
- Transient context: .eval/ inside target project (gitignored)
- callClaude: `claude --print --model haiku` with CLAUDECODE deleted
- Parser: R-numbered format (`### R{n}:`) or section-based (`## {section}`)
- Multi-line gate parsing (numbered items and bullets)
- mc.core.create API: (parentPath, key, content) — three args

## Implementation Patterns (project 14)
- P1: Uniform Factory — default export, takes execDoc, returns operator
- P2: Config as Indirection — config.json has only module path
- P3: Lib Convention — shared internals in lib.js, not registered
- P4: Three Channels — data state, execution state, realtime state
- P5: Minimize Conditionals — normalize data, don't branch
- P6: Point of View — resources CWD-relative, functionality root-relative
- P7: Resolution Through Map — execDoc.resolve for all cross-protocol access
- Patterns documented in mycelium/patterns.md
- Quality gates: functional + pattern (splectrum/quality-gates.md)
- Autonomy gap analysis in splectrum/autonomy.md

## spl4 Scope (agreed)
1. ~~Uniform factory pattern + bug fixes~~ (project 14, done)
2. Cascading references — repository facet (project 15).
   Folder-to-remote mapping, mc.xpath traverses transparently.
   Local overlay (nearest distance). Internalized data
   (context-optimized view) alongside optional local copy
   of source. Meaning facet (links, AI-optimized
   hierarchies, context pollution vs spread) → post-spl4.
3. mc.git protocol + changelog view — formalize git
   operations into a protocol, changelog as view over
   git data (not separate storage). Impacts mc.raw
   compound ops (move/copy need git awareness).
4. mc.raw compound operations (move, copy) — git-aware
5. Stream consumers for exec data — simple processing first
6. Model + spawn protocol (capstone) — model/ folder as
   full mycelium install (autonomous, self-sufficient).
   Parent mycelium (spl4) can run/override operations on
   it. Two modes: from within = model's mc runs; from
   parent = parent's mc operates on model as resource.
   Spawn analyzes model, builds install package, seeds
   new git repo. Foundation for multi-repository.
   Every spawned repo is autonomous but governable by parent.

## spl4 Exit Gate
- Critical review of spl4 (like spl2 review that seeded spl3/spl4)
- Assess autonomy gap: where did pattern gates catch issues
  vs where human intervention was still needed
- Set roadmap for spl5 and beyond based on evidence

## Roadmap (outside spl4)
- Multiple UUID identity per resource (context-relative PKs)
- Reference-based permission model
- Schemas: Avro (avsc) — convention → metadata → RPC
- mc.xpath/resolve → mc.xpath/select (XPath naming)
- mc.boot protocol when boot complexity demands it
- Bare runtime for Pear P2P platform
- Polymorphic views, content-addressed integrity
- Schema evolution, compaction
- API crystallization, layered know-how
- P2P / federation
