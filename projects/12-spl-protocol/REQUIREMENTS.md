# Project 12: spl as Protocol

## Goal

Promote spl to a protocol with a boot operation.
Establish mc.proto resolve as the universal resolution
mechanism, persisted in the module cache. Migrate
context-view to the new registration format.

## spl/boot

1. spl/boot is the entry point. The bash wrapper calls
   node spl.mjs which runs spl/boot — the one hardcoded
   operation (it can't resolve itself via a map that
   doesn't exist yet).

2. spl/boot sequence:
   - Ensure proto map (build if stale, load from cache)
   - Import mc.proto/map.js (module cache persists the
     resolve function across calls within the process)
   - Create exec doc (map as non-enumerable property —
     data persistence without polluting faf stream)
   - faf start drop
   - Resolve protocol/operation from CLI args
   - Import module, call factory(doc), get bound operator
   - Invoke operator with args
   - faf complete drop
   - Format output

3. spl/init rebuilds the proto map explicitly. Invoked
   as `spl spl init`. Resolved normally (boot already
   loaded the map to get there).

## Persistence Model

4. Code persistence: mc.proto/map.js in the module cache.
   The resolve function and map logic stay loaded for the
   process lifetime. No reload needed — module cache is
   the mechanism.

5. Data persistence: proto map as non-enumerable property
   on exec doc. Accessible to all operations via doc.map.
   Invisible to JSON.stringify, stays out of faf drops.

6. Cross-process persistence: map.json on disk. Each new
   process loads it at boot. Staleness detection triggers
   rebuild when registrations change.

## mc.proto as Universal Resolution

7. mc.proto.resolve is the single resolution mechanism.
   Available to any protocol operation via the exec doc.
   Protocol operations resolve other protocols through
   doc.map, not through direct imports or SPL_ROOT.

## context-view Migration

8. Migrate context-view to operation-level registration
   (context-view/sync with module/function/format config).

9. context-view/sync uses the factory pattern — takes
   exec doc, returns bound operator.

## Roadmap

- mc.boot protocol when boot complexity demands it.
  For now spl/boot is sufficient.
- Schemas, physical layer, Bare/P2P — see model.md.

## Constraints

- KISS — minimum to make spl a protocol with boot.
- SPL_ROOT read once by spl/boot from env, then carried
  on exec doc as doc.root. Protocol operations use
  doc.root, never process.env.SPL_ROOT.
- Existing protocols (stats, tidy) continue to work
  (refactored to use doc.root instead of SPL_ROOT).
