# Project 08: Dogfood — Evaluation

## What Was Built

Three phases in one project:

1. **Session via environment.** Removed root parameter
   from all protocol APIs. Protocols read SPL_ROOT from
   process.env. Every API call lost a parameter.

2. **mc.data + mc.meta.** Namespace filters on mc.core.
   mc.data excludes .spl from all operations (user data
   view). mc.meta scopes to .spl/meta/ (metadata access).
   Both are thin — mc.data is a filter, mc.meta is a
   path prefix.

3. **Context-view on mc protocols.** scan.js rewritten
   to use mc.data.list for project discovery and mc.raw.read
   for text content. First real consumer of the protocol
   stack. cli.js updated for async. haiccer.js and
   persist.js updated to read SPL_ROOT from env.

## Key Decisions

**Environment as session.** SPL_ROOT is set once by the
spl bash wrapper and read by every protocol. No parameter
threading. The environment IS the session for now.
cwd semantics deferred — tied to scope isolation, not
a simple env var.

**mc.data filters at list time.** .spl entries removed
from list results. Read/create/update/del reject .spl
paths explicitly. Clean enforcement at the boundary.

**mc.meta uses path prefixing.** Caller addresses
relative to context (e.g. 'context.json'), mc.meta adds
.spl/meta/ prefix. The caller doesn't hardcode .spl
paths — the semantic is "metadata of this context."

**scan.js uses mc.data + mc.raw.** mc.data for listing
(excludes .spl), mc.raw for reading (utf-8 format
convenience). haiccer and persist keep direct fs for
writes — they're output operations, not data access.

## What We Learned

The dogfooding was smooth. scan.js is cleaner with mc
protocols — no findRoot(), no manual stat() calls, no
hidden-file filtering. mc.data.list gives you what you
want (project directories) without the noise.

The environment session eliminated a parameter from
every call. The APIs read better: `data.list('/projects')`
instead of `data.list(root, '/projects')`.

mc.meta's path prefixing is simple but effective. The
caller says `meta.read('/', 'context.json')` — no
knowledge of .spl/ paths needed.

## Changes Outside This Project

- All protocols updated: root parameter removed
- `.spl/proto/mc.data/` — new
- `.spl/proto/mc.meta/` — new
- `.spl/proto/context-view/` — scan.js, cli.js,
  haiccer.js, persist.js all updated

## Carry Forward

- Single-path addressing for mc.meta / mc.proto — walk
  path segments deepest-first, check for .spl/meta (or
  .spl/proto) expansion at each context boundary. Root
  selection determines whether literal paths are tried.
  Needs simple, slick solution.
- mc.raw compound operations (move, copy)
- Ancestor chain resolution in mc.proto
- Scope isolation / path rebasing
- Protocol config schema
- Documentation consolidation pass
