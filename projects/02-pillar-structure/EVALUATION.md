# Project 02: Pillar Structure — Evaluation

## What Was Built

Four top-level buckets, each with vocabulary and content:

```
mycelium/              — the data world
  vocabulary.md          terms: record, context, metadata,
                         mutable/immutable, changelog, flat,
                         traversal, reference, layer, tool
  model.md               proven model (from PRINCIPLES.md 1.1–1.6)
  data-api.md            flat API requirements
  references.md          horizontal and vertical composition
  layers.md              stacked contexts, capability composition
  tools.md               context-invocable, layer-resolved

splectrum/             — the language world
  vocabulary.md          terms: definition, requirement, concept,
                         protocol, evaluation, quality gate
  context-view.md        concept: contexts describe themselves
  evaluation.md          concept: meaning is evaluable against intent
  requirements.md        concept: expressed intent, natural language
  quality-gates.md       concept: intent made checkable

haicc/                 — the creative world
  vocabulary.md          terms: entity, build cycle, project,
                         autonomy, iteration
  evaluator.md           requirement: quality gates in build cycle
  spawn.md               requirement: spawning new iterations

exploratory-repo/      — context type for this kind of repo
  README.md              type overview, derives from git-repo
  root-marker.md         structure: identifies context root
  project.md             structure: context with shape and lifecycle
  requirements.md        structure: intent record in a project
  evaluation.md          structure: fitness record in a project
  context-description.md structure: self-generated orientation
  context-view.md        tool: input/output/internal schema
```

## Key Decisions

### Pillars are worlds, not filing cabinets

Mycelium = data world. Splectrum = language world.
HAICC = creative world. They are perspectives on the
same reality, not partitions. A thing can be referenced
from multiple pillars but is expressed where its primary
nature lives.

### Definitions vs requirements

Definitions live at the logical level (Splectrum) —
they say what something means. Requirements live at the
capability level (HAICC) — they say what an
implementation must satisfy. Quality gates bridge them.

### Vocabulary is local to each bucket

Meaning depends on context. Each pillar has its own
vocabulary. The vocabularies should be coherent when
compared but are not centralized. This follows the
nearest distance principle.

### Exploratory-repo is a context type

The structures and tools specific to our repository
type are grouped together, not scattered across pillars.
This type derives from git-repo (a mutable context with
immutable changelog) but we keep a flat structure until
tool maturity justifies the separation.

### Mycelium vision: references, layers, tools

Captured three forward-looking definitions:
- References: horizontal (remote contexts) and vertical
  (layers)
- Layers: stacked contexts with nearest-distance data
  resolution, capability composition
- Tools: invoked from contexts, resolved through layer
  stack, atomic names

These are defined but not yet built. They emerged from
discussing how to embed the context-view tool and how
context types should compose.

## What We Learned

### The three-level pattern

Splectrum concept (general definition) → HAICC
requirement (specific to our workflow) → exploratory-repo
structure (concrete data shape). This pattern repeated
for context-view, evaluation, and requirements. It's
the natural layering of meaning.

### Structure is behavior applies to the repo itself

The pillar directories aren't just organization — they
make the model's concerns structurally distinguishable,
which was part of the spl4 mission.

### Atomic tools + layer resolution

Tools stay atomic (proprietary internals). The context's
layer stack determines which tools are available and
which implementation is invoked. This replaces both
global registries and type hierarchies.

### Git as Mycelium capability

A git repository maps to Mycelium naturally: mutable
context with immutable changelog (resource-first mode).
Tools can use git capabilities directly for changelog,
diffing, and history.

## Carry Forward

The structural framework is in place. The next project
can embed the context-view tool into the exploratory-repo
type — the structures it needs are defined, the reference
implementation exists, and the Mycelium model describes
how tools integrate with contexts.

The Mycelium vision (references, layers, tool resolution)
is captured as definitions. Building these core
components is the path to making context types composable
and tools discoverable through structure.

## Changes Outside This Project

- Created mycelium/, splectrum/, haicc/,
  exploratory-repo/ at repo root
- Mycelium model detail extracted from PRINCIPLES.md
  into mycelium/model.md (PRINCIPLES.md unchanged)
