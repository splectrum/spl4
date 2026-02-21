# Principles

The system comprises three pillars: Mycelium (data),
Splectrum (meaning), HAICC (creative action). Meaning is
central — data serves it, creative action enacts it. The
project bears the name Splectrum because meaning is at
the centre of everything.

The fundamental participant is the **entity**. An entity is
anything that participates — human, AI, process, sensor,
capability, tool. No special cases. The same principles
apply to all.

The autonomy target: physical fully AI autonomous, logical
interactive collaborative. The system acts autonomously on
structure, code, environments, testing, deployment. Meaning,
scope, design, and direction are collaborative. Collaboration
on meaning is Splectrum's nature, not a limitation to solve.

Simplicity in realization. If a principle creates
implementation complexity, tweak the principle. The simplest
mechanism that serves the purpose wins.

---

## Pillar 1: Mycelium (Data)

Mycelium is the data world. A layered context model:
records in contexts, recursive, with operations over them.
How data is organised, stored, accessed, layered. The
repository structure that everything else builds on.

### 1.1 The Primitive

**Record** = key → content (opaque bytes).

**Context** = container of records. Records can themselves
be contexts.

Keys are meaningful only within their containing context.
Content is opaque — the model does not interpret it.
Everything else (typing, hashing, references, meaning) is
layered above.

This primitive was proven sufficient across 27 projects
(spl3 + spl4). No extensions were required.

### 1.2 Operations

| Operation | Category | Description |
|---|---|---|
| list | read | Keys in a context |
| read | read | Content of a record |
| flatten | read | All keys recursively (relative paths) |
| create | write | New record |
| update | write | Overwrite existing record |
| del | write | Remove a record |
| move | compound | Relocate a record (git mv) |
| copy | compound | Duplicate a record (new history) |

Compound operations compose from primitives but use the
most efficient substrate action (P8). The operation set
is minimal and complete.

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
structure to the resource directly.

**Metadata-driven behavior** — Mutability, changelog mode,
and enforcement are driven by metadata accumulated during
traversal. No flags, no configuration. Structure is behavior.

### 1.5 Changelog

Change tracking for mutable records:

**Sibling record** — Changelog for `foo` is `foo.changelog`,
a record in the same context. Visible, readable, flattenable.

**Three modes:**
- **none** — no tracking (default; most records)
- **resource-first** — resource is truth, log is audit
- **log-first** — log is truth, resource is derived

### 1.6 Behavioural Principles

**Structure is behavior.** No flags, no configuration.
A context with a bin has soft delete. A flat context
skips interior traversal. What you build is how it behaves.

**Nearest distance.** Definitions reside closest to their
realization. Inner overrides outer.

**Data-triggered processing.** Data state drives
progression. Presence/absence determines what happens next.

**Point of view.** The working directory sets the reference
context. Resources are relative to POV — you can only see
what is in front of you. Functionality is root-relative
and always available. POV separates the data context of
a process from the wider system context. Cascading
references bring out-of-view resources into view.

**Cascading references.** Contexts declare reference stacks.
Reads fall through layers (nearest distance). Writes go
local (copy-on-write). Hidden contexts provide structural
access control. Repository facet proven; meaning facet
open.

### 1.7 Vision (Open, Not Proven)

- **Cascading references (meaning facet)** — links as
  visible connections. AI-controlled knowledge hierarchies.
  The structure itself as an attention mechanism.
- **Polymorphic views** from the same underlying data
- **Location-transparent identity** — multiple context-
  relative PKs
- **Content-addressed integrity** — hash-based verification
- **Schema evolution** — Avro path, proven in spl2
- **Compaction** — history compression preserving capability
- **P2P / federation** — cross-boundary distribution

These earn their way in when practical need demands them.

---

## Pillar 2: Splectrum (Meaning)

The meaning world. What makes data meaningful — the
language, concepts, requirements, quality gates. Data is
shaped by meaning. Meaning is not a property of the data;
it is what the data is for.

### 2.1 Test-Driven Creation (TDC)

**Meaning carries quality.** Fitness-for-purpose is
derivable from intent and context.

**Natural language requirements.** Conversation produces
meaning. Meaning gets formalised into requirements.

**Quality gates from meaning.** Requirements carry their
own verification criteria. The translation from requirement
to gate is a Splectrum operation — meaning becomes
checkable assertion. Two kinds: functional gates (does it
work?) and pattern gates (will it compose?).

### 2.2 Evaluation

**Entity-neutral.** Quality gates don't require a specific
entity type — they need a different perspective on the
same output.

**Natural language at the logical level.** The evaluator
operates on natural language requirements and content.
Formal validation, code checking, structured testing are
capability bindings.

**Data-triggered pipeline.** Prepare → translate →
evaluate → report. Horizontal slicing (one evaluation per
requirement). Each slice independently restartable.

### 2.3 Focus Over Efficiency

Tailoring context to task is a meaning concern — deciding
what information is relevant, how it should be prepared,
what level of detail serves this specific purpose. That
is Splectrum's domain: expressing the right meaning for
the right moment.

If the context is perfectly tailored, it is small because
irrelevant information was excluded by design. Efficiency
is the consequence, not the objective.

### 2.4 Atomic Tools

A tool may use any internal access method. Mycelium
compatibility is at the boundary — inputs and outputs are
records in contexts. Atomic tools produce value
independently before integration.

### 2.5 Vision (Open, Not Proven)

- **Discover** — tailored meaning extraction. Not "get me
  data" but "extract this specific aspect from this data."
  Produces efficient data blocks for agent consumption.
- **Dynamic resources** — a resource that declares "generate
  me using protocol X." Abstraction of data origin.
- **API crystallization** — solved problems becoming
  discoverable, composable capabilities
- **Layered know-how** — quality gates compounding across
  context levels

---

## Pillar 3: HAICC (Creative Action)

The creative world. The dynamic process: build cycle,
spawn, evaluation. Where capabilities live — the
translation of meaning into tools on the ground. Meaning
is enacted through creative action.

### 3.1 Entity-Neutral

All entities are treated equally. No privileged entity type.

### 3.2 Autonomy Target

Physical fully AI autonomous. Logical interactive
collaborative. The boundary shifts as capabilities evolve,
but the two sides have different natures: physical
autonomy is a gap to close; logical collaboration is a
feature to preserve.

### 3.3 The Build Cycle

Decide → scope → require → build → test → evaluate.
Each step produces something concrete. The cycle repeats
per project. AI decides implementation, human steers
meaning. Each iteration moves some steps forward, not the
whole distance.

### 3.4 Lifecycle Model

Three stages, applied per concern:
- **POC** — discrete projects, exploration. Prove concepts.
- **Pilot** — dev environments, packaging, deployment.
  Concepts become operational.
- **Production** — versioning, evolution, governance.
  Operational becomes mature.

Stages coexist. Each new capability enters at POC. Concerns
develop at their own pace, like organs of a body.

### 3.5 Spawn

A context seeds a new context. Critical self-examination
before spawning. The seed is an information package, not
a template — the target makes its own structural decisions.
Governance during candidacy (model/ as subrepo). Autonomy
after deployment.

### 3.6 Evidence-Based

Decisions grounded in evidence from the work, not
speculation. The immutable project history provides the
evidence base.

---

## The Virtuous Cycle

    HAICC: entities collaborate, produce meaning
        ↓
    Splectrum: meaning formalises into requirements
        ↓
    Mycelium: formalised meaning persists as records
        ↓
    Splectrum: evaluation confirms fitness
        ↓
    Mycelium: evidence accumulates in contexts
        ↓
    HAICC: evidence informs the next cycle
        ↓
    (cycle compounds)
