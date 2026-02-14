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
- Eight operations: list, read, flatten, create, write, delete, append, move
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

## Protocol Architecture (current as of project 12)

### spl as protocol
- spl is a registered protocol with operations
- spl/boot is hardcoded entry point (can't resolve itself)
- spl/init rebuilds proto map (`spl spl init`)

### Factory pattern (from spl2)
- Async factories: exported function takes exec doc,
  imports mc deps via doc.root, returns bound operator
- No env var dependency in protocol operations
- spl/boot creates exec doc, awaits factory, invokes operator

### Session (exec doc)
- doc.root — repo root (enumerable, appears in faf)
- doc.map — proto map (non-enumerable, invisible to faf)
- SPL_ROOT read once by spl/boot, never by operations

### Persistence model
- Code: module cache (mc.proto/map.js loaded once per process)
- Data: proto map as module-level variable + non-enumerable on exec doc
- Cross-process: map.json on disk, no staleness detection
- Rebuild: explicit via spl/init or mapModule.rebuild()

### Protocol stack
- mc.xpath — resolve paths to Locations
- mc.core — six primitives + append (stable contract)
- mc.raw — format layer on mc.core (pre-semantic)
- mc.data — user data view (.spl filtered)
- mc.meta — metadata view (.spl/meta/ scoped)
- mc.proto — protocol resolution (map-based)

### Registration (operation-level)
- .spl/proto/<protocol>/<operation>/config.json
- Config: module, function, format
- Proto map: protocol/operation → context + config
- Longest prefix match for multiple registrations

### Dev vs deployed
- Deployed code in .spl/proto/ (running)
- Dev/reference copies in project src/

## Deployed Code
- `.spl/spl.mjs` — spl/boot entry point
- `.spl/proto/mc.proto/map.js` — proto map builder/resolver
- `.spl/proto/mc.exec/exec.js` — faf execution store
- `.spl/proto/mc.xpath/resolve.js` — location resolver
- `.spl/proto/mc.core/core.js` — six primitives
- `.spl/proto/mc.raw/raw.js` — format layer on mc.core
- `.spl/proto/mc.data/data.js` — user data view
- `.spl/proto/mc.meta/meta.js` — metadata view
- `.spl/proto/spl/init.js` — proto map rebuild
- `.spl/proto/stats/stats.js` — context statistics
- `.spl/proto/context-view/context-view.js` — CONTEXT.md generator
- `.spl/proto/evaluate/evaluator.js` — quality gate evaluator
- `.spl/proto/evaluate/parser.js` — requirements parser
- `projects/.spl/proto/tidy/tidy.js` — transient cleanup
- `spl` — bash wrapper (sets SPL_ROOT, exec node)

## Reference Code
- `reference/context-view/` — CONTEXT.md generator (from spl3/05)
- `reference/context-layer/` — flat API, traversal, storage capabilities (from spl3/08)
- `reference/evaluator/` — requirements evaluation pipeline (from spl3/09)

## Evaluator Protocol
- evaluate/run — full pipeline (prepare → translate → evaluate → report)
- evaluate/status — check pipeline phase
- Data-triggered: file presence determines what steps run
- Transient context: .eval/ inside target project (gitignored)
- callClaude: `claude --print --model haiku` with CLAUDECODE deleted
- Parser: R-numbered format (`### R{n}:`) or section-based (`## {section}`)
- mc.core.create API: (parentPath, key, content) — three args

## Carry Forward
- Protocol resolution through doc.map (operations currently hardcode mc module paths)
- Cascading references (horizontal) and layering (vertical)
- Path validation (no `../` traversal)
- Schemas: Avro (avsc) — convention → metadata → RPC
- Bare runtime for Pear P2P platform
- mc.boot protocol when boot complexity demands it
- mc.raw compound operations (move, copy)
- Stream consumers for exec data
