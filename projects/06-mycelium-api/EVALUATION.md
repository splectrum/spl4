# Project 06: Bootstrap Chain — Evaluation

## What Was Built

The Mycelium bootstrap chain. Three small pieces that
prove the architecture end to end:

- **mc.proto boot** — the one bootstrap protocol. Direct
  file access, stateless, 8 lines of logic. Resolves
  protocol name → config from .spl/proto/.
- **mc.xpath** — stateless location resolver. Root as
  parameter, no closures. Filesystem substrate today.
- **spl rework** — bash wrapper sets SPL_ROOT from git,
  node module runs the chain: boot mc.proto → resolve
  mc.xpath → verify root → resolve protocol → invoke.

The chain invokes context-view and produces CONTEXT.md.
Real protocol, real output, through the bootstrap path.

## Key Decisions

**Stateless protocols.** No factories, no instances, no
closures hiding state. Protocols receive what they need
as parameters. State is explicit and exposed. This was
a mid-project pivot — the first implementation used
factory functions (createXPath, createRaw) that captured
root in closures. Questions about why state was hidden
led to the stateless design.

**One bootstrap seam.** mc.proto is the only protocol
with a boot implementation. Boot mc.proto uses direct
file access (filesystem assumption, cwd = root). All
other protocols are resolved through it. Once mc.raw
exists, proper mc.proto replaces boot — uses mc.raw
instead of direct file access, substrate-agnostic.
Boot restrictions don't leak into the running system.

**Global vs local protocols.** mc bundles (mc.xpath,
mc.raw, mc.data, mc.meta, mc.proto) are global — same
implementation everywhere, registered at repo root.
Local protocols (changelog, etc.) are per-context,
resolved via mc.proto at runtime. Same resolution
mechanism for both.

**Session holds execution state.** Root comes from the
environment (git repo root → terminal session variable).
cwd is Mycelium's equivalent of shell cd. Protocols
pick up session context, they don't create their own.

**spl as boundary.** spl validates at the boundary,
protocols trust internally. Currently pass-through,
validation comes when the capability exists. Internal
concern, no architectural change needed.

**Deployed vs dev separation.** Code runs from
.spl/proto/, project keeps reference copies. Proper
dev environments wait for cascading references and
layering.

## What We Learned

The design conversation was more valuable than the code.
~80 lines of implementation, but the architecture it
proves is fundamental. The factory-based approach from
the previous session was functional but wrong-shaped.
The stateless pivot changed the trajectory.

mc.proto as the only boot protocol is a clean result.
One direct file access point, everything else composed.
The bootstrap sequence is minimal and the restriction
boundary is clear.

Protocol config is currently unstructured (context-view
has `run`, mc.xpath has `module`). No schema. Fine for
now — the protocols are few and the consumer (spl)
knows what to look for. Will need attention as protocols
multiply.

mc.raw was deferred — originally in scope as mc.core.
Correct call. The architecture wasn't clear enough to
build it right. Now it is.

## Changes Outside This Project

- `.spl/proto/mc.proto/` — new (boot.js, config.json,
  package.json)
- `.spl/proto/mc.xpath/` — new (resolve.js, config.json,
  package.json)
- `.spl/spl.mjs` — new (bootstrap logic)
- `spl` — rewritten (bash wrapper, was inline bash)

## Note: Architectural Documentation

We are making significant architecture and design
decisions along the way — stateless protocols, bootstrap
sequence, global vs local, session model, boundary
validation. These are captured in project NOTES.md files
and in the mycelium/ docs, but they accumulate across
projects and the connections between them aren't tracked.

Question: should we spend a project organising and
consolidating this documentation (updating mycelium/
model docs, principles, addressing), or is this an
end-of-spl4 activity? The risk of deferring is that
decisions drift from documentation. The risk of doing
it now is that the architecture is still forming and
we'd be documenting a moving target.

Recommendation: a lightweight documentation pass after
the next project (mc.raw + proper mc.proto), when the
core protocol bundle is complete and the architecture
has stabilised enough to document with confidence.

## Carry Forward

- mc.raw — five stateless operations, next project
- Proper mc.proto — replaces boot, uses mc.raw
- Namespace filters (mc.data, mc.meta) on mc.raw
- Session formalisation (root + cwd as explicit object)
- Protocol config schema
- Dev environment strategy (when layering available)
