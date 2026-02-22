# Deployed Protocols

Inventory of protocols built in spl4, ready for
dev env repos in spl5. 41 operations across 14
protocols.

## Mycelium (mc.*)

Base data layer. 28 operations. Core infrastructure
that all other protocols depend on.

| Protocol | Operations | Role |
|---|---|---|
| mc.xpath | resolve | Path → location resolution |
| mc.core | list, read, create, update, del | Five primitives, Buffer in/out |
| mc.raw | list, read, create, update, del, move, copy | Format layer + compound ops |
| mc.data | list, read, create, update, del | User data view (.spl filtered) |
| mc.meta | list, read, create, update, del | Metadata view (.spl/meta/ scoped) |
| mc.exec | create, drop, complete, fail | Execution state, faf streaming |
| mc.proto | resolve | Map-based protocol resolution |

**Shared internals:** mc.exec/lib.js

**Dependencies:** mc.raw → mc.core → mc.xpath.
mc.data/mc.meta/mc.proto → mc.core.
mc.exec is independent (filesystem direct).

## Repo Management

6 operations. Git integration, statistics, context
description.

| Protocol | Operations | Role |
|---|---|---|
| git | changelog, checkpoint, log, status | Git substrate integration |
| stats | collect | Context statistics |
| context-view | scan, sync | CONTEXT.md generation |

**Shared internals:** context-view/lib.js

**Dependencies:** git → filesystem (execSync).
stats → mc.data, mc.raw. context-view → mc.raw,
mc.data, git.

## Quality

3 operations. Evaluation and testing. Evaluate is
project-scoped (registered at projects/).

| Protocol | Operations | Scope | Role |
|---|---|---|---|
| evaluate | run, status | projects/ | Quality gate evaluation |
| test | run | root | Test harness |

**Shared internals:** evaluate/lib.js, test/lib.js

**Dependencies:** evaluate → mc.raw, mc.core
(+ claude CLI for AI evaluation). test → mc.raw.

**Note:** evaluate/run calls `claude --print --model
haiku` for AI-powered requirement evaluation.

## Bootstrap

3 operations. System initialization and cleanup.
Tidy is project-scoped.

| Protocol | Operations | Scope | Role |
|---|---|---|---|
| spl | init | root | Proto map rebuild |
| tidy | scan, clean | projects/ | Transient file cleanup |

**Shared internals:** tidy/lib.js

**Dependencies:** spl/init → mc.proto/map (direct
import, bootstrap). tidy → mc.data, mc.raw.

## Boot Infrastructure

Not registered as protocols — boot infrastructure
that runs before the proto map exists.

- `spl` (bash wrapper) — discovers root, builds
  seed doc, launches node
- `.spl/spl.mjs` — parses seed, boots map, creates
  exec doc, resolves and invokes
- `.spl/proto/mc.proto/map.js` — proto map builder,
  imported directly at boot

## Dev Env Grouping (spl5)

Protocols group naturally into dev env repos:

1. **mycelium** — mc.xpath, mc.core, mc.raw, mc.data,
   mc.meta, mc.exec, mc.proto + boot infrastructure.
   The foundation. Everything depends on this.

2. **tools** — git, stats, context-view, tidy.
   Repo management and housekeeping. Depends on
   mycelium.

3. **quality** — evaluate, test. Quality gates and
   testing. Depends on mycelium. Evaluate also
   depends on external AI (claude CLI).

4. **spl** — spl/init + boot. Bootstrap protocol.
   Tightly coupled to mycelium — may stay together
   or become part of mycelium repo.

These groupings are starting points. Dev env
creation in spl5 will refine the boundaries.
