# Bootstrap

How the system starts. One protocol has a boot
implementation. Everything else follows from that.

## The Sequence

1. `spl` invoked at repo root (bash wrapper)
2. spl sets SPL_ROOT from git, launches node
3. Boot mc.proto loaded — direct file access, one
   known location (.spl/proto/mc.proto/)
4. Boot mc.proto resolves proper mc.proto config
5. Proper mc.proto loaded — uses mc.core.read,
   substrate-agnostic
6. mc.xpath resolved and loaded — verify root is
   a mycelium context
7. Requested protocol resolved and invoked

## Boot mc.proto

The only protocol with a boot implementation. Direct
file access, assumes filesystem substrate, reads
SPL_ROOT from environment.

Minimal: read one config.json from a known path.
Just enough to resolve the real mc bundles. Boot
restrictions (filesystem assumption, known path)
don't leak into the running system.

## Proper mc.proto

Uses mc.core.read instead of direct file access.
Substrate-agnostic — works with any mc.core
implementation, not just filesystem. Replaces boot
after the bootstrap chain completes.

## Design Properties

**One seam.** Boot mc.proto is the single point where
the system assumes a filesystem. Everything after
bootstrap goes through the protocol stack.

**Self-replacing.** The boot protocol resolves its own
replacement. The proper mc.proto handles all subsequent
resolution.

**No boot leakage.** Once the bootstrap chain completes,
no protocol depends on filesystem assumptions. The boot
code path is not reachable from the running system.
