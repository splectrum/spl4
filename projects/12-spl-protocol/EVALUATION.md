# Project 12: spl as Protocol — Evaluation

## What Was Built

**spl/boot** — spl promoted to a protocol. spl.mjs
rewritten as boot entry point: reads SPL_ROOT once
from env, ensures proto map via module cache, creates
exec doc with root (enumerable) and map (non-enumerable),
faf bookends every invocation, resolves and dispatches.

**Persistence model** — three-layer design. Code in
module cache (map.js loaded once per process). Data as
module-level variable and non-enumerable exec doc
property. Cross-process via map.json on disk. No
staleness detection — explicit rebuild via `spl spl init`.

**SPL_ROOT eliminated from protocol operations** — all
protocols (stats, tidy, context-view) refactored to
async factories that import mc modules via execDoc.root.
Env var read once by boot, never by operations.

**context-view resurrected** — migrated from old format
(cli.js + "run" config) to factory pattern with two
operations (sync, scan). Working end-to-end including
from within Claude Code sessions.

**6 registered operations**: spl/init, stats/collect,
tidy/scan, tidy/clean, context-view/sync, context-view/scan.

## Design Decisions

- No staleness detection — KISS. The process that changes
  registrations rebuilds. Eliminates the mtime-walking
  scanner entirely.

- Non-enumerable properties for runtime-only context on
  exec doc — clean separation between operational data
  (functions, map) and audit data (faf drops).

- Async factories — necessary consequence of moving
  imports from module top-level into factory scope (where
  doc.root is available). Small change to spl.mjs
  (`await factory(doc)`), clean result.

- Module cache as code persistence, module-level variable
  as data persistence, map.json as cross-process cache.
  Three layers, each serving its natural concern.

## What We Learned

Collaborative design produced significant simplification
combined with stronger design. The boot discussion —
three exchanges — produced module cache for code, exec
doc for data, no staleness. Each iteration simpler than
the previous version.

Module cache as persistence mechanism is a natural fit
for Node's process model. No custom caching needed.

Removing staleness detection was the right call. The
mtime-walking scanner was the most complex part of
map.js. Replacing it with explicit rebuild (`spl spl init`)
eliminated complexity and made the caching model clear:
load once, use for the process, rebuild when you know
things changed.

Non-enumerable properties are the clean bridge between
operational context (functions, map data) and serialized
audit trail (faf drops). JSON.stringify ignores them
naturally — no custom serializers needed.

## Friction

Had to delete cached map.json manually on first deploy
because removing staleness detection meant the old map
was served forever. This is the trade-off — first deploy
required manual cache clear. After that, `spl spl init`
handles it cleanly.

## Concerns

None significant. The design is clean and minimal.

## Roadmap Notes

Captured in mycelium/model.md:
- Schemas: Avro (avsc, pure JS) — convention → metadata
  → RPC. Proven in spl2.
- Physical layer: Bare runtime for Pear P2P platform.
  Hypercore as storage. Transition mainly package.json
  import maps.
- mc.boot protocol when boot complexity demands it.
  For now spl/boot is sufficient.

## Changes Outside This Project

- .spl/spl.mjs — rewritten (boot sequence)
- .spl/proto/mc.proto/map.js — rewritten (root param,
  module cache, no staleness)
- .spl/proto/mc.exec/exec.js — rewritten (root param)
- .spl/proto/spl/init.js — new (map rebuild)
- .spl/proto/spl/init/config.json — new (registration)
- .spl/proto/stats/stats.js — refactored (async, doc.root)
- .spl/proto/context-view/context-view.js — new (migrated)
- .spl/proto/context-view/sync/config.json — new
- .spl/proto/context-view/scan/config.json — new
- .spl/proto/context-view/cli.js — removed
- .spl/proto/context-view/config.json — removed
- .spl/proto/context-view/scan.js — removed
- .spl/proto/context-view/haiccer.js — removed
- .spl/proto/context-view/persist.js — removed
- .spl/proto/context-view/package.json — removed
- projects/.spl/proto/tidy/tidy.js — refactored (async)
- package.json — new (type: module)
- mycelium/protocols.md — updated (session, factory)
- mycelium/bootstrap.md — rewritten (spl/boot)
- mycelium/model.md — updated (schemas, physical layer)
- PRINCIPLES.md — updated (append operation)
- POSITIONING.md — updated (eight ops, protocol system)

## Carry Forward

- Scope isolation + path rebasing
- Schemas: Avro (avsc) graduated path
- Bare runtime for Pear P2P
- mc.boot protocol when needed
- Stream consumers for exec data
