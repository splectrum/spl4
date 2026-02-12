# Project 07: mc.core + mc.raw + Proper mc.proto — Evaluation

## What Was Built

- **mc.core** — five primitive operations (list, read,
  create, update, del). Buffer in, Buffer out. The
  stable contract that doesn't grow.
- **mc.raw** — delegates to mc.core, adds format
  interpretation. Read supports Buffer, utf-8, JSON.
  Write detects content type (Buffer, string, object).
  Ready for compound operations (move, copy) later.
- **Proper mc.proto** — uses mc.core.read to resolve
  protocol configs. Replaces boot after bootstrap.
- **spl upgrade** — boot mc.proto used once to resolve
  proper mc.proto, then proper handles all resolution.

## Key Decisions

**mc.core vs mc.raw separation.** Initially built as
one protocol (mc.raw). Clarified that mc.core is the
primitive contract (five operations, opaque bytes) and
mc.raw is a richer structural layer on top. mc.raw
extends without changing mc.core's contract.

**mc.raw is pre-semantic.** Format interpretation (text,
JSON) is structural convenience, not meaning. The
semantic layers (mc.data, mc.meta, mc.proto) add meaning
to structures. mc.raw stays below that boundary.

**Proper mc.proto uses mc.core, not mc.raw.** Reading
a config file is a primitive operation. mc.proto doesn't
need format convenience — it parses JSON itself.

**mc.raw format detection on writes.** Buffer passes
through, string encodes as utf-8, object serializes as
JSON. Single toBuffer function at the boundary. Read
format is explicit (parameter), write format is implicit
(content type detection).

## What We Learned

The mc.core/mc.raw distinction emerged from conversation,
not from the original plan. The original scope was just
"mc.raw + proper mc.proto." Naming matters — mc.core and
mc.raw describe genuinely different responsibilities.

Implementation was straightforward once the architecture
was clear. mc.core is a direct port of the previous code
with renamed error messages. mc.raw is a thin delegation
layer with format conversion. Proper mc.proto is five
lines of substance.

## Changes Outside This Project

- `.spl/proto/mc.core/` — new (core.js, config.json,
  package.json)
- `.spl/proto/mc.raw/raw.js` — rewritten (was five
  primitives, now delegates to mc.core with format layer)
- `.spl/proto/mc.raw/config.json` — updated
- `.spl/proto/mc.proto/resolve.js` — new (proper resolve)
- `.spl/proto/mc.proto/config.json` — updated (points
  to resolve.js)
- `.spl/spl.mjs` — updated (boot → proper transition)

## Carry Forward

- mc.raw compound operations (move, copy)
- mc.data, mc.meta namespace filters on mc.core
- Ancestor chain resolution in mc.proto
- Scope isolation / path rebasing
- Session formalisation
- Documentation consolidation pass
