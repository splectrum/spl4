# Positioning

## Intellectual Lineage

Mycelium's roots are in a convergence:

- **Jay Kreps (2013):** "The log is the fundamental data
  structure." All databases are caches of subsets of the log.
- **Martin Kleppmann (2014):** "Turn the database inside out."
  The write-ahead log should be the primary external interface.
- **Rich Hickey (2012):** "The database as an immutable value."
  Facts are immutable. State is derived.

These converge on: immutable log → derived everything.
Mycelium builds on this convergence but diverged during
implementation into a context-centric model.

## What Mycelium Actually Is

A **context-centric data interaction model.**

Not log-centric (though changelogs use immutable append).
Not graph-centric (though contexts nest recursively).
Not document-centric (though records hold opaque content).

The organizing unit is the **context** — a container of
records where metadata determines behavior. Contexts nest.
Traversal accumulates metadata along the path. Structure
is behavior.

### What exists as proven code

- Record/context primitive with seven operations
- Three-layer architecture: logical, capability, physical
- Two interchangeable storage capabilities (folder, file)
- Flat API with metadata-driven enforcement
- Context traversal with nearest-distance accumulation
- Changelog as sibling records with three causality modes
- Data-triggered evaluation pipeline (natural language
  requirements → quality gate results)
- Context-view generator (cold-start orientation)

### What makes this different (proven)

**Context traversal with nearest distance.** Metadata
accumulates along the path. Inner overrides outer. The
context closest to the resource has final say. No central
configuration.

**Metadata-driven mutability.** Same context changes state
over time. Mutability is data, not type. No separate
interfaces for mutable vs immutable — one API, runtime
enforcement.

**Structure is behavior.** A bin sub-context enables soft
delete. A flat flag controls traversal depth. Changelog
mode drives tracking. Build the structure you need; it
behaves accordingly.

**Atomic tools.** Tools use whatever internal access they
need. Mycelium compatibility is at the boundary. Value
before integration.

**Natural language quality gates.** Requirements evaluated
by AI against content. Entity-neutral — any entity that
understands the language can evaluate.

## Closest Relatives

### Datomic — Immutable facts, everything derived

Closest to Mycelium's immutable heritage. Datoms as sole
primitive. Database-as-value. But: flat datom space (no
contexts), fixed index orderings (no metadata-driven
behavior), no concept of traversal accumulation.

### Fluree — Immutable semantic graph

Shares immutability and cascading references (via RDF).
But: W3C standards dependency, no flat API concept, no
metadata-driven behavior model.

### TerminusDB — Immutable layers, git-like

Shares immutable layers and distribution model. But:
graph-only, no context-centric traversal, no metadata
accumulation.

### EventStoreDB (Kurrent) — Pure event sourcing

Shares append-only streams and derived state. Mycelium's
log-first changelog mode is event sourcing. But:
stream-centric not context-centric, no hierarchical
metadata, no structural behavior model.

## Where Mycelium Diverged

The original vision (spl2) positioned Mycelium as bridging
immutable-log-first systems and multi-model databases —
combining polymorphic views, P2P, semantic navigation, and
compaction.

During spl3, the model diverged. Instead of building toward
polymorphic views and cascading references, the work
discovered that **context + metadata + traversal** was the
more productive organizing principle. The flat API with
nearest-distance accumulation emerged as the core
architectural insight.

This divergence is honest. The original positioning described
a system that would do everything. What was actually built
is narrower but coherent: a context-centric model where
structure determines behavior.

## Open Vision

These remain as direction, not yet proven:

- **Polymorphic views** from the same underlying data
- **Cross-context references** as structural primitives
- **Location-transparent identity**
- **Capability-preserving compaction**
- **P2P distribution**

Each earns its way in when practical need demands it.

## Positioning Statement

Mycelium is a context-centric data interaction model where
structure determines behavior. Records live in contexts.
Metadata accumulates along traversal paths. The nearest
context to a resource has final say over its behavior.
Operations are flat — one API surface, runtime enforcement
from accumulated metadata.

It emerged from the immutable-log tradition but found its
own shape: not log-first, not schema-first, not graph-first,
but context-first.
