# Principles

The system comprises three pillars: Mycelium (data),
Splectrum (expression), HAICC (creation). Each has
principles. Together they form a virtuous cycle.

The fundamental participant is the **entity**. An entity is
anything that participates — human, AI, process, sensor,
capability, tool. No special cases. The same principles
apply to all.

The aim is to remove entity involvement to the maximum
beneficial extent. If the system can do it autonomously,
it should. Entities step in where they add genuine value.

Simplicity in realization. If a principle creates
implementation complexity, tweak the principle. The simplest
mechanism that serves the purpose wins.

---

## Pillar 1: Mycelium (Data)

Mycelium is a data interaction model. It defines how data
is structured, accessed, and behaved — independent of where
or how data is physically stored or transmitted.

### 1.1 The Primitive

**Record** = key → content (opaque bytes).

**Context** = container of records. Records can themselves
be contexts.

Keys are meaningful only within their containing context.
Content is opaque — the model does not interpret it.
Everything else (typing, hashing, references, meaning) is
layered above.

This primitive was proven sufficient across 9 projects
spanning storage, changelog, traversal, and evaluation.
No extensions were required.

### 1.2 Operations

| Operation | Category | Description |
|---|---|---|
| list | read | Keys in a context |
| read | read | Content of a record |
| flatten | read | All keys recursively (relative paths) |
| create | write | New record |
| write | write | Overwrite existing record |
| delete | write | Remove a record |
| append | write | Add to existing record |
| move | compound | Read + create + delete across contexts |

Compound operations (move, update) compose from primitives.
The operation set is minimal and complete.

### 1.3 Three Layers

**Logical** — Structures and operations. What exists and
what you can do with it. Zero dependency on storage or
substrate. Pure interface.

**Capability** — Binds logical to physical. Implements the
operations against a specific substrate or interaction.
Multiple capabilities are interchangeable — same behavior,
different backing.

**Physical** — The substrate itself. Folders and files.
A single JSON file. A database. An API. A network call.
The physical layer has no opinions — it is whatever the
capability wraps.

The storage capability has zero knowledge of metadata,
mutability, or behavior. It stores and retrieves bytes.
All intelligence lives in the context layer above.

### 1.4 Context Layer

The context layer sits between the logical interface and
the storage capability. It provides:

**Traversal** — Walk the path from root to target. At each
segment, check for context definitions (metadata). Merge
into accumulator. Nearest distance wins — inner context
overrides outer.

**Flat contexts** — A context marked flat means "my interior
is content, not sub-contexts." Traversal hops over physical
structure to the resource directly. The context controls how
its own interior is navigated.

**Metadata-driven behavior** — Mutability, changelog mode,
and enforcement are driven by metadata accumulated during
traversal. No flags, no configuration. Structure is behavior.

**Metadata sources** — Transient (supplied at invocation)
and stored (persisted as records in contexts). Both feed
the same accumulation. Merge mode determines precedence
when they conflict.

### 1.5 Changelog

Change tracking for mutable records:

**Sibling record** — Changelog for `foo` is `foo.changelog`,
a record in the same context. Visible, readable, flattenable.
Not hidden metadata.

**Three modes:**
- **none** — no tracking (default; most records)
- **resource-first** — resource is truth, log is audit
- **log-first** — log is truth, resource is derived

**Cascading** — A context's changelog aggregates its
children's changelogs. Derived, not stored.

**Delete behavior** — Depends on structure. If a bin
sub-context exists, delete moves there. If not, delete
is permanent. Structure determines behavior.

### 1.6 Behavioral Principles

**Structure is behavior.** No flags, no configuration.
A context with a bin has soft delete. A flat context
skips interior traversal. A context with changelog mode
tracks changes. What you build is how it behaves.

**Nearest distance.** Definitions reside closest to their
realization. A context's metadata lives in that context,
not in a central registry. Inner overrides outer.

**Data-triggered processing.** Data state drives
progression. Each step reads inputs from records, writes
outputs as records. Presence/absence determines what
happens next. Stateless steps, data as checkpoint.

**Resolution spectrum.** The same meaning at different
granularity: natural language (opaque) → structured file
(partially explicit) → individual records in contexts
(fully explicit). All the same primitive at different
resolution.

**Point of view.** The working directory sets the reference
context. Resources are relative to POV — you can only see
what is in front of you, never behind. Functionality
(operations, modules) is root-relative and always available.
Paths are context-relative primary keys: the same resource
has different identities from different viewpoints.
Cascading references bring out-of-view resources into view
and form the base level of permission.

### 1.7 Vision (Open, Not Proven)

These are described in earlier principle documents and
remain as direction. They are not in the current model
and have not been proven in code.

- **Polymorphic views** — same data accessed as relational,
  document, graph, key-value, or other patterns
- **Cascading references (repository facet)** — folder-to-remote
  mapping with transparent traversal. Local overlay via nearest
  distance. Internalized data (context-optimized view) alongside
  optional local copy of source. (POV principle proven, building)
- **Cascading references (meaning facet)** — links as visible
  connections. AI-controlled knowledge hierarchies optimized for
  minimal context pollution with maximal coverage. The structure
  itself as an attention mechanism. (post-spl4)
- **Location-transparent references** — identity independent
  of physical location (multiple context-relative PKs
  designed, not yet built)
- **Content-addressed integrity** — hash-based verification
- **Schema evolution** — backward-compatible structural change
- **Compaction** — history compression preserving capability
- **P2P / federation** — cross-boundary distribution

These earn their way into the proven model when practical
need demands them.

---

## Pillar 2: Splectrum (Expression)

How meaning gets expressed, evaluated, and crystallized.

### 2.1 Test-Driven Creation (TDC)

**Meaning carries quality.** Fitness-for-purpose is
derivable from intent and context, not separately specified.

**Natural language requirements.** Conversation produces
meaning. Meaning gets formalized into requirements. The
formalization is natural, not bureaucratic.

**Quality gates from meaning.** Requirements carry their
own verification criteria. The translation from requirement
to gate is a Splectrum operation — meaning becomes
checkable assertion.

**The cycle:** Intent → requirements → build → evaluate →
capture learnings. Each cycle produces both created meaning
and evolved understanding.

### 2.2 Evaluation

**Entity-neutral.** AI evaluating AI output catches real
discrepancies. Quality gates don't require a specific
entity type — they need a different perspective on the
same output.

**Natural language at the logical level.** The evaluator
operates on natural language requirements and content.
Formal validation, code checking, structured testing are
capability bindings — different ways to implement the same
logical evaluation.

**Data-triggered pipeline.** Stateless steps driven by
data state. Prepare → translate → evaluate → report.
Horizontal slicing (one evaluation per requirement).
Each slice independently restartable.

### 2.3 Process Contexts

**Transient lifecycle.** Short-lived contexts linked to the
main context: spawn → process → compact → detach. Working
state stays separate. Main context accumulates only
compacted results.

**Tailored data environments.** Each process creates the
structure it needs. Not one structure for all — shape
matches processing needs.

**Prompts as data.** Executable artifacts that are also
inspectable, storable, portable records.

### 2.4 Atomic Tools

A tool may use any internal access method (filesystem,
database, API, hardcoded logic). Mycelium compatibility is
at the boundary — inputs and outputs are records in
contexts. A tool becomes Mycelium-integrated when it can
be invoked through Mycelium and its results land as
Mycelium records.

Atomic tools produce value independently before integration.
Integration is a step, not a prerequisite.

### 2.5 Vision (Open, Not Proven)

- **API crystallization** — solved problems becoming
  discoverable, composable capabilities with attached
  meaning
- **Layered know-how** — quality gates compounding from
  simple to complex across context levels
- **Composition** — capabilities combining into higher-level
  capabilities driven by meaning

---

## Pillar 3: HAICC (Creation)

How entities collaborate to create.

### 3.1 Entity-Neutral

All entities are treated equally. No privileged entity type.
The same data model and evaluation mechanisms serve all
participants.

### 3.2 Maximum Beneficial Autonomy

If the system can act autonomously, it should. Entities
participate where they add genuine value. The boundary
between autonomous and collaborative shifts as capabilities
evolve.

### 3.3 The Build Cycle

Decide → build → evaluate → evolve. AI sets the
implementation path. Human steers principles and meaning.
Each iteration moves some steps forward, not the whole
distance.

### 3.4 Vision and Evaluation

Direction-setting and fitness evaluation are where entity
involvement adds most value. Everything between intent and
evaluation is a candidate for autonomy.

### 3.5 Evidence-Based

Decisions grounded in evidence from the work, not
speculation. The immutable project history provides the
evidence base.

---

## The Virtuous Cycle

    HAICC: entities collaborate, produce meaning
        ↓
    Splectrum: meaning formalizes into requirements
        ↓
    Mycelium: formalized meaning persists as records
        ↓
    Splectrum: evaluation confirms fitness
        ↓
    Mycelium: evidence accumulates in contexts
        ↓
    HAICC: evidence informs the next cycle
        ↓
    (cycle compounds)
