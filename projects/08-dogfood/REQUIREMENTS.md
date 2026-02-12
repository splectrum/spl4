# Project 08: Dogfood — Requirements

## Goal

Complete the mc protocol bundle with namespace filters,
simplify protocol APIs via environment session, and
update context-view to consume the mc stack. First
real dogfooding of the protocol bundle.

## Phases

### Phase 1: Session via environment

Remove root parameter from all protocol APIs. Protocols
read SPL_ROOT from process.env internally.

- mc.xpath.resolve(path) — no root parameter
- mc.core.list(path), read(path), create(parentPath, key),
  update(path, content), del(path) — no root parameter
- mc.raw same — no root parameter
- mc.proto.resolve(name) — no root parameter
- spl.mjs sets SPL_ROOT (already does), stops passing
  root to protocol calls
- Boot mc.proto: reads SPL_ROOT from env

### Phase 2: mc.data + mc.meta

Namespace filters on mc.core. Thin layers.

**mc.data** — user data view. Excludes .spl from all
operations.
- list: filters out entries under .spl
- read: errors if path is under .spl
- create/update/del: errors if path is under .spl

**mc.meta** — metadata view. Scoped to .spl/meta/.
- All operations scoped to .spl/meta/ of a context
- list: lists within .spl/meta/
- read: reads from .spl/meta/
- Caller addresses relative to context, filter adds
  the .spl/meta/ prefix

### Phase 3: Context-view on mc protocols

Update context-view to use mc.data and mc.meta instead
of direct filesystem access. First real consumer of the
protocol stack.

- scan.js uses mc.data.list for project discovery
- scan.js uses mc.data.read for file content
- scan.js uses mc.meta.read for metadata
- Proves the stack works for a real tool

## Implementation

- Plain JS, ES modules
- Environment-based session (SPL_ROOT)
- mc.data and mc.meta in .spl/proto/
- context-view updated in place

## Quality Gates

- All protocols work without root parameter
- mc.data.list excludes .spl entries
- mc.data.read errors on .spl paths
- mc.meta.read returns metadata content
- context-view produces CONTEXT.md using mc protocols
- ./spl context-view works end to end
