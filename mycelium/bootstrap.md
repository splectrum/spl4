# Bootstrap

How the system starts.

## The Sequence

1. `spl` invoked at repo root (bash wrapper)
2. spl sets SPL_ROOT from env, launches node with spl.mjs
3. spl.mjs loads mc.proto/map.js — the proto map builder
4. Map checks staleness, rebuilds if needed (scans
   all .spl/proto/ directories)
5. Protocol/operation resolved via map lookup
6. Module imported, factory called with exec doc
7. Bound operator invoked with arguments

## The Bootstrap

The proto map builder (mc.proto/map.js) is the bootstrap.
It reads the filesystem directly — scanning .spl/proto/
directories and their config.json files. This is the
one point where the system assumes a filesystem.

The map is cached at .spl/exec/state/mc/proto/map.json.
Staleness detection via directory mtimes ensures the
map stays current without scanning on every invocation.

## Design Properties

**One seam.** The map builder is the single point where
the system assumes a filesystem. All protocol operations
are invoked through the map's resolved module paths.

**Minimal.** The bootstrap is a scan + cache. No chain,
no self-replacing protocol, no multi-step resolution.

**No boot leakage.** The map builder runs at startup
if needed. Protocol operations never interact with
it — they receive their exec doc from spl and work
through the factory pattern.
