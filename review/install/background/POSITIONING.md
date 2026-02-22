# Positioning

## The Bigger Picture

Splectrum is a structured environment for working with
meaning. Mycelium provides the data structure. Splectrum
provides the meaning structure. Both exist to serve HAICC
— collaborative creation. The aim is not just to organise
data or express meaning, but to enable entities (human,
AI, process) to create together effectively.

A structured environment that facilitates working with
meaning in general — not just code, not just documents,
not just data, but meaning as a first-class concern — is
the foundation for a new kind of collaborative creation.

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
  (list, read, create, update, del, move, copy)
- Three-layer architecture: logical, capability, physical
- Flat API with metadata-driven enforcement
- Context traversal with nearest-distance accumulation
- Changelog as sibling records with three causality modes
- Protocol system: 37 operations across 13 protocols,
  uniform factory pattern, map-based resolution with
  longest prefix match
- Cascading references: read-only overlay, copy-on-write,
  hidden contexts, structural access control
- Execution store: fire-and-forget streaming, data/state
  split, boundary trust model
- Data-triggered evaluation pipeline (natural language
  requirements → quality gate results)
- Git substrate protocol, process compliance checking
- Eight implementation patterns (P1-P8), mechanically
  verifiable

### What makes this different (proven)

**Context traversal with nearest distance.** Metadata
accumulates along the path. Inner overrides outer. The
context closest to the resource has final say. No central
configuration.

**Metadata-driven mutability.** Same context changes state
over time. Mutability is data, not type. One API, runtime
enforcement.

**Structure is behavior.** Build the structure you need;
it behaves accordingly.

**Cascading references.** Contexts declare reference
stacks. Reads fall through layers, writes go local
(copy-on-write). Hidden contexts provide structural
access control. Repository facet proven in spl4.

**Uniform protocol pattern.** Every operation follows the
same shape: async factory takes exec doc, returns bound
operator. Config is pure indirection (module path only).
Resolution through map. No exceptions across 37
operations.

**Natural language quality gates.** Requirements evaluated
by AI against content. Entity-neutral.

## The Landscape (2026)

### Context engineering as discipline

The industry has recognised that context management — not
model capability — is the differentiator. "Context
engineering" has replaced "prompt engineering" as the
recognised discipline. Google ADK separates context into
four layers. DataHub hosted an entire conference on
context management. The thesis is mainstream.

However: all current approaches treat context as something
humans design for agents to consume. The framework
architect prescribes the structure. The agent operates
within it.

### Agent-controlled context: emerging

**Letta (formerly MemGPT)** is the closest system to
Splectrum's vision. Context Repositories (February 2026):
git-backed filesystem (MemFS), agent-curated folders of
markdown files, progressive disclosure. The agent maintains
its own memory structure over time.

**Manus** treats the filesystem as extended memory. Agents
write progress files, manage their own state through file
I/O. Self-directed context management without a formal
model.

Both have arrived at the intuition that the AI should
manage its own context. Neither has a formal data model
underneath. The difference: giving an empty room versus
giving a well-designed workspace with operational
semantics.

### Retrieval evolution

RAG has evolved beyond naive vector similarity. GraphRAG
uses knowledge graphs for structured traversal. TreeRAG
adds hierarchical summarisation. Autonomous knowledge
graph construction is real (ATLAS, Graphiti). But these
are retrieval indices, not working contexts. The AI
queries the graph; it doesn't live in it.

### Protocol architectures

MCP (Model Context Protocol) is retrieval and tool
plumbing — standardised connection, not context
organisation. No scoped override, no structural context
management.

No system combines Splectrum's full pattern: uniform
factory + config-as-indirection + filesystem registration
+ longest-prefix-match override. Backstage is closest
for uniform factory. Apache Sling for scoped override
(but overrides values, not behaviour).

### Closest relatives

**Datomic** — immutable facts, everything derived. Closest
to Mycelium's heritage. But: flat datom space (no
contexts), no metadata-driven behavior.

**Fluree** — immutable semantic graph. Shares cascading
references (via RDF). But: W3C dependency, no flat API.

**TerminusDB** — immutable layers, git-like. But:
graph-only, no context-centric traversal.

**EventStoreDB (Kurrent)** — pure event sourcing. Shares
append-only streams. But: stream-centric not
context-centric.

**Letta** — AI-controlled context through filesystem.
Shares the intuition. But: no formal model, no metadata-
driven behaviour, no recursive contexts, no protocol
architecture.

## Where Splectrum Is Different

Others are discovering that the AI should manage its own
context. Splectrum provides the formal model that makes
that management meaningful.

**Formal model, not ad hoc filesystem.** Letta's MemFS is
markdown files in folders. Mycelium is records in recursive
contexts with seven operations, three layers, and metadata-
driven behaviour. The model gives structure to the
organisation, not just freedom.

**The AI operates through the model, not alongside it.**
Tools consume the context layer. Operations are the
fundamental verbs. The agent doesn't just store knowledge;
it works within a structured semantic space.

**Metadata as operational semantics.** Metadata drives
behaviour — mutability, changelog modes, operation
dispatch. Metadata is not descriptive; it is functional.

**Point of view.** Resources are CWD-relative (what you
see depends on where you stand). Functionality is
root-relative. No other system gives the agent a
structural perspective that changes based on position.

**Meaning as a first-class concern.** The Splectrum pillar
exists because meaning is not just a property of data — it
is what the data is for. Quality gates translate meaning
into checkable assertions. Evaluation confirms fitness.
Focus over efficiency: tailoring context to task is a
meaning concern, not an optimisation problem.

**Collaborative creation as the purpose.** Mycelium and
Splectrum exist to serve HAICC — the creative process
where entities collaborate to produce. This is not a
data platform or a retrieval system. It is a structured
environment for working with meaning, aimed at enabling
collaborative creation.

## Open Vision

These remain as direction, not yet proven:

- **Cascading references (meaning facet)** — AI-controlled
  knowledge hierarchies, attention through structure
- **Discover** — tailored meaning extraction, producing
  efficient data blocks for agent consumption
- **Dynamic resources** — resources that declare how to
  generate themselves
- **Polymorphic views** from the same underlying data
- **Location-transparent identity** — multiple context-
  relative PKs per resource
- **Schema evolution** — Avro path, proven in spl2
- **P2P distribution** — Pear platform, Hypercore storage

Each earns its way in when practical need demands it.

## Positioning Statement

Splectrum is a structured environment for working with
meaning. Mycelium provides the data model — context-centric,
metadata-driven, structure-is-behaviour. Splectrum provides
the meaning model — requirements, quality gates, evaluation,
focus over efficiency. HAICC provides the creative process
— build cycle, spawn, entity-neutral collaboration.

Together they form an environment where entities collaborate
to create, supported by a formal model that the AI both
consumes and organises. Not retrieval. Not prescribed
context. Structured meaning, collaboratively created.
