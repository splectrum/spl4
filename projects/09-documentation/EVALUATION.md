# Project 09: Documentation Consolidation — Evaluation

## What Was Built

Four new model documents in mycelium/:

1. **protocols.md** — Protocol stack architecture. The
   layered bundle (mc.xpath → mc.core → mc.raw →
   semantic layer), stateless design, session concept,
   mc.core vs mc.raw distinction, resolution model,
   single-path addressing direction.

2. **bootstrap.md** — Boot sequence. One protocol with
   a boot implementation, self-replacing, no boot
   leakage into running system.

3. **scope.md** — Scope isolation architecture.
   Execution context, invocation boundaries,
   bidirectional path rebasing, path semantics,
   forward scope vs cascading references,
   distance-based visibility direction.

4. **diagrams.md** — Mermaid diagrams: protocol stack
   with design decisions, bootstrap sequence, context
   hierarchy, scope isolation, ancestor chain resolution.

Four existing documents updated:

- **vocabulary.md** — Added 9 terms: session, protocol
  stack, mc.core, mc.raw, scope boundary, static/dynamic,
  boot, real/virtual context.
- **model.md** — Added real vs virtual contexts and
  scripting semantics (or-chaining).
- **addressing.md** — Added path semantics across scope
  boundaries and ancestor chain resolution.
- **tools.md** — Cross-reference to protocols.md and
  bootstrap.md.

## Key Decisions

**Three documents, not one.** Protocols, bootstrap, and
scope are distinct concerns. Protocols is what the stack
is. Bootstrap is how it starts. Scope is how invocations
create boundaries. Each stands alone and cross-references.

**Proven vs designed.** Sections clearly mark what's
implemented vs what's architecture-settled but not yet
built. Both belong in the model — implementation follows
design. Labeled with "(Designed)" or "(Direction)".

**Model level, not implementation.** These describe the
logical architecture. The code is the implementation.
No code snippets, no file paths, no API signatures in
the model docs.

## What We Learned

The gap was larger than expected — projects 06–08
produced as much architecture as the first five projects
combined. The protocol stack, scope isolation, and
bootstrap sequence are foundational architecture that
was only discoverable through project archaeology.

The existing mycelium/ docs (model, api, vocabulary,
layers, references, tools, addressing) covered the
abstract model well. What was missing was the bridge
to realization — how the abstract concepts become
running protocols.

## Changes Outside This Project

- mycelium/protocols.md — new
- mycelium/bootstrap.md — new
- mycelium/scope.md — new
- mycelium/diagrams.md — new
- mycelium/vocabulary.md — updated (9 new terms)
- mycelium/model.md — updated (real/virtual, scripting)
- mycelium/addressing.md — updated (scope paths, ancestor)
- mycelium/tools.md — updated (cross-references)

## Carry Forward

- Update CONTEXT.md via context-view sync after commit
- Evaluator protocol as next consumer (project 10)
- Single-path addressing implementation
- mc.raw compound operations
- Ancestor chain resolution
- Scope isolation implementation
