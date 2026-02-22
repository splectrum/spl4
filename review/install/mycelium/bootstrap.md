# Bootstrap

How the system starts.

## spl/boot

spl is a protocol with operations. spl/boot is the
entry point — the one hardcoded operation (it can't
resolve itself via a map that doesn't exist yet).

## The Sequence

1. `spl` bash wrapper discovers repo root via
   `git rev-parse --show-toplevel`
2. Builds seed doc `{"root":"...","argv":[...]}`,
   passes as JSON arg to spl.mjs
3. spl.mjs parses seed — the one seam
4. Imports mc.proto/map.js (module cache persists the
   code for the process lifetime)
5. Ensures the proto map (load from disk or build from
   filesystem scan). Module-level variable persists
   the data.
6. Imports mc.exec, mc.proto/resolve
7. Creates exec doc — root (enumerable, appears in faf),
   map + prefix + resolvePath + resolve (non-enumerable,
   invisible to faf)
8. faf start drop
9. Resolves protocol/operation via map lookup
10. Imports operation module, calls async factory with
    exec doc, gets bound operator
11. Invokes operator with remaining CLI args
12. faf complete drop
13. Formats output

## Persistence Model

Three layers of persistence, each serving a different
concern:

**Code persistence** — mc.proto/map.js in the Node
module cache. The resolve function and map logic stay
loaded for the process lifetime. Imported once at boot,
available to all subsequent callers in the same process.

**Data persistence** — proto map as non-enumerable
property on the exec doc. Accessible to all operations
via doc.map. Invisible to JSON.stringify, stays out of
faf drops. Root as enumerable property (doc.root) —
appears in faf for audit.

**Cross-process persistence** — map.json on disk. Each
new process loads it at boot. No staleness detection —
the process that changes registrations calls rebuild().
`spl spl init` is the explicit rebuild command.

## Design Properties

**One seam.** The seed doc JSON argument is parsed once
by spl.mjs. After that, doc.root carries it. Protocol
operations never touch process.env or process.argv.

**Minimal.** Boot loads one module, ensures one cache,
creates one doc. No chain, no multi-step resolution.

**No boot leakage.** Protocol operations receive their
exec doc from spl/boot and work through the factory
pattern. They don't know or care about the boot sequence.

## Roadmap

mc.boot protocol when boot complexity demands it.
For now spl/boot is sufficient.
