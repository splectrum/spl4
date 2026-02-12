# Project 09: Documentation Consolidation

## Goal

Organize architecture decisions from projects 06–08 into
the mycelium/ pillar as authoritative model documentation.
These decisions are currently buried in project NOTES.md
and evaluations. They belong in the model — they describe
how Mycelium's abstract concepts realize as protocols.

## What Needs a Home

From projects 06–08:

- Protocol stack architecture (mc.xpath → mc.core →
  mc.raw → mc.data / mc.meta / mc.proto)
- Stateless protocol design (no factories, no closures)
- Session concept (SPL_ROOT from env, cwd future)
- Bootstrap sequence (boot mc.proto → proper mc.proto)
- Ancestor chain resolution (nearest distance, static
  vs dynamic)
- Scope isolation (invocation boundaries, bidirectional
  rebasing, forward scope)
- Path semantics (relative at invocation, absolute
  inside execution)
- Forward scope (r/w) vs cascading references (r/o)
- Real vs virtual contexts
- Scripting semantics (or-chaining)
- mc.core vs mc.raw distinction
- Single-path addressing direction (carry forward)

## Requirements

1. New model documents in mycelium/ for the protocol
   architecture — what we built and what we designed.

2. Distinguish proven (implemented, tested) from designed
   (architecture settled, not yet built). Both belong in
   the model. Implementation follows design.

3. Update existing vocabulary.md with protocol stack
   terms.

4. Keep documents concise, model-level. Not implementation
   guides — the code is the implementation. These describe
   the logical architecture.

5. No duplication — project NOTES.md remains as historical
   record. Model docs are the authoritative source going
   forward.
