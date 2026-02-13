# Project 11: Protocol Resolution

## Goal

Resolve protocol names to their registration context
using a cached proto map. Removes the fully qualified
path workaround — `spl tidy scan` instead of
`spl projects/.spl/proto/tidy scan`.

## Proto Map

1. Scan all .spl/proto/ directories in the repo. Build
   a map: protocol name → list of context paths where
   registered.

2. Store the map at `.spl/exec/state/mc/proto/map.json`.

3. Rebuild when spl detects registration changes since
   last build. Detection: compare current .spl/proto/
   directory state against stored map.

## Resolution

4. Given a protocol name and a target path, resolve to
   the registration whose context path is the longest
   prefix of the target path.

5. If no target path given, resolve from root (longest
   prefix of `/`).

6. If the protocol name contains `/`, treat as fully
   qualified (existing behavior, no map needed).

## spl Integration

7. spl.mjs reads the proto map on startup. If missing
   or stale, rebuilds before dispatch.

8. Named resolution (`spl tidy scan`) uses the map.
   Fully qualified resolution (`spl .../proto/tidy`)
   uses direct config read (unchanged).

9. The target path comes from the first argument after
   the protocol name, or defaults to `/`.

## Constraints

- KISS — minimum implementation that makes named
  resolution work for all registered protocols.
- No changes to protocol registration format.
- Graceful degradation: if map is missing, build it.
