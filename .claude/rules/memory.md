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
- process/ — actionable process standards (guidance + requirements)
- exploratory-repo/ — context type for this kind of repo

## Protocol Architecture (current as of project 17)

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
- git — version control substrate (status, checkpoint, log, changelog)

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
- `.spl/proto/mc.xpath/resolve.js` — location resolver (layers, bucket)
- `.spl/proto/mc.xpath/fs_cascading.js` — filesystem substrate library
- `.spl/proto/mc.core/{list,read,create,update,del}.js` — five primitives (layer-aware)
- `.spl/proto/mc.raw/{list,read,create,update,del}.js` — format layer
- `.spl/proto/mc.data/{list,read,create,update,del}.js` — user data view
- `.spl/proto/mc.meta/{list,read,create,update,del}.js` — metadata view
- `.spl/proto/mc.exec/{lib,create,drop,complete,fail}.js` — execution state
- `.spl/proto/spl/init.js` — proto map rebuild
- `.spl/proto/stats/collect.js` — context statistics
- `.spl/proto/context-view/{lib,sync,scan}.js` — CONTEXT.md generator
- `.spl/proto/evaluate/{lib,run,status,parser}.js` — quality gate evaluator + process compliance
- `.spl/proto/git/{lib,checkpoint,status,log,changelog}.js` — git substrate protocol
- `.spl/proto/test/{lib,run}.js` + suites/ — test harness + library
- `projects/.spl/proto/evaluate/{run,status}/config.json` — project-scoped
- `projects/.spl/proto/tidy/{lib,scan,clean}.js` — transient cleanup

## Reference Code
- `reference/context-view/` — CONTEXT.md generator (from spl3/05)
- `reference/context-layer/` — flat API, traversal, storage capabilities (from spl3/08)
- `reference/evaluator/` — requirements evaluation pipeline (from spl3/09)

## Cascading References (project 15)
- .spl/data/refs.json: name → [{ target: "/absolute/path" }, ...]
- .spl/data/hidden.json: ["hidden-name", ...]
- Stack: local (implicit, mutable) > remote-1 > remote-2
- mc.xpath: operator(path), operator.layers(path), operator.bucket(path)
- mc.core/list: gets layers from mc.xpath, does physical merge
- mc.core create/update: copy-on-write for reference targets
- mc.core del: rejects reference-only paths
- .spl/data/ namespace: operational data (not meta, not proto)
- Only .spl is infrastructure; other dot folders are data
- Hiding: hide+reference = structural immutability

## Process Standards (project 16)
- process/ top-level folder, referenced into projects
- Guidance: build-cycle.md, requirements.md, evaluation.md, quality-gates.md
- Requirements: req-build-cycle.md, req-evaluation.md, req-requirements.md,
  req-quality-gates.md, req-project.md (42 checkable requirements)
- Adoption roadmap: evaluator compliance → convention → protocol
- Natural flow over enforcement (no CLAUDE.md pointers)
- Process docs evolve through use, not planning

## Evaluator Protocol
- evaluate/run — full pipeline with haiku retry (callClaude/tryCallClaude)
- evaluate/status — check pipeline phase
- Data-triggered: file presence determines what steps run
- Transient context: .eval/ inside target project (gitignored)
- callClaude: `claude --print --model haiku` with CLAUDECODE deleted
- Parser: R-numbered format (`### R{n}:`) or section-based (`## {section}`)
- Multi-line gate parsing (numbered items and bullets)
- mc.core.create API: (parentPath, key, content) — three args
- Process compliance: checkCompliance reads process/req-*.md through
  cascading references, determines applicability by artifact presence,
  produces compliance-report.md in .eval/

## Git Protocol (project 17)
- git/ not mc.git/ — external substrate, not data model
- git/checkpoint — stage + commit + push, Claude-generated commit messages
  (caller provides intent/headline, haiku agent fills detail from diff)
- git/status — structured file status scoped to path
- git/log — structured commit history scoped to path
- git/changelog — reverse changelog: derived markdown from git history
- git/lib.js — git() and gitSafe() wrappers around execSync
- Usage: `spl git checkpoint . "intent headline"`

## Implementation Patterns (project 14+)
- P1: Uniform Factory — default export, takes execDoc, returns operator
- P2: Config as Indirection — config.json has only module path
- P3: Lib Convention — shared internals in lib.js, not registered
- P4: Three Channels — data state, execution state, realtime state
- P5: Minimize Conditionals — normalize data, don't branch
- P6: Point of View — resources CWD-relative, functionality root-relative
- P7: Resolution Through Map — execDoc.resolve for all cross-protocol access
- P8: Internal Efficiency — mc protocols use most efficient access internally
- Patterns documented in mycelium/patterns.md
- Quality gates: functional + pattern (splectrum/quality-gates.md)
- Autonomy gap analysis + process adoption roadmap in splectrum/autonomy.md

## spl4 Scope (agreed)
1. ~~Uniform factory pattern + bug fixes~~ (project 14, done)
2. ~~Cascading references — repository facet~~ (project 15, done)
   fs_cascading, .spl/data/ namespace, refs.json + hidden.json,
   mc.xpath layers/bucket, mc.core merge, copy-on-write,
   hiding mechanism. 66 tests. Meaning facet → post-spl4.
3. ~~Process standards~~ (project 16, done)
   process/ folder: 4 guidance docs + 5 requirement sets
   (42 checkable requirements). Referenced into projects.
   Adoption roadmap: evaluator → convention → protocol.
   Natural flow over enforcement.
4. ~~git protocol + evaluator compliance~~ (project 17, done)
   git/checkpoint (smart commit), git/status, git/log,
   git/changelog (reverse changelog). Evaluator process
   compliance through cascading references. 80 tests.
5. mc.raw compound operations (move, copy) — git-aware
6. Stream consumers for exec data — simple processing first
7. Model + spawn protocol (capstone) — model/ folder as
   full mycelium install (autonomous, self-sufficient).
   Parent mycelium (spl4) can run/override operations on
   it. Two modes: from within = model's mc runs; from
   parent = parent's mc operates on model as resource.
   Spawn analyzes model, builds install package, seeds
   new git repo. Foundation for multi-repository.
   Every spawned repo is autonomous but governable by parent.

## Discover Protocol (seed — next project)
- Semantic layer: understanding on demand, not just data access
- Two tiers: direct tools (fast, local) + discover (rich, resolved)
- mc.* protocols get buried behind conversation-level protocols
- Three protocol kinds: infrastructure (mc.*), tool (git, evaluate), conversation (discover)
- Agent context = references (visibility) + protocol (capability) + required detail (preparation)
- Mix and match: direct when sufficient, protocol when it adds value
- Full thinking captured in mycelium/discover.md

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
