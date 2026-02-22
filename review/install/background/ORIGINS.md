# Origins

## Lineage

Splectrum has evolved through multiple iterations:

- **spl0/spl1:** Early explorations. Established the vision
  of entity-collaborative software creation.
- **spl2:** 13 projects. Built a container/method framework,
  tool wrappers, self-eval system, CLI. Defined the three
  pillars (Mycelium, Splectrum, HAICC), CIPs, and extensive
  architecture documents. All 33 containers passing
  self-validation. Proved the three-pillar model. Produced
  extensive positioning research (50+ systems surveyed).
- **spl3:** 9 projects. Booted the Mycelium model from
  principles to working code. Proved the record/context
  primitive, three-layer architecture, flat API, context
  traversal, and data-triggered evaluation. Built two
  operational Splectrum tools.
- **spl4:** 18 projects. The integration iteration. Connected
  the Mycelium model to practical tool use through
  dogfooding. Proved the protocol stack, uniform factory
  pattern, cascading references, and self-hosting tools.
  POC complete.
- **spl5 (this):** Pilot. Dev environments, spawn protocol,
  repo diversification. Move proven protocols from
  monolithic to independent.

## What spl2 Achieved

- Proved the three-pillar model (Mycelium, Splectrum, HAICC)
- Defined the immutable-list primitive and polymorphic view
  model
- Established TDC (test-driven creation) and the brick
  principle
- Validated entity-neutral collaboration through practice
- Produced extensive positioning research (50+ systems)
- Distilled principles from analysis (15 documents)

## What spl2 Taught

- Don't build infrastructure before building real things
- Technology decisions belong to the implementing entity
- The vision was right; the approach was premature
- Each iteration compacts into the next

## What spl3 Achieved

- Proved the record/context primitive is sufficient — no
  extensions needed across 9 projects
- Three-layer architecture (logical, capability, physical)
  with two interchangeable storage substrates
- Flat API with metadata-driven behavior and context
  traversal with nearest-distance accumulation
- Changelog as sibling records with three causality modes
- Two Splectrum tools: context-view (cold-start orientation)
  and evaluator (natural language quality gates)
- Data-triggered processing as a general pattern
- Self-containment assets (TOOL.md, config.md, CONTEXT.md)
  as emergent schema candidates
- The HAICC build cycle in practice: AI decides, builds,
  evaluates; human steers and validates

## What spl3 Taught

- Build incrementally — each iteration moves some steps,
  not the whole distance
- The primitive is sufficient — resist adding new ones
- Atomic tools produce value independently before
  integration
- Simplicity wins — flat API over type hierarchy, transient
  metadata over premature persistence
- Vision and implementation diverge — reconcile regularly
- The model diverged from log-centric to context-centric
  during implementation, and that divergence was productive

## What spl3 Left Open

- Tools and API exist independently — not yet connected
- Metadata is transient — not yet stored/self-describing
- Three concerns (data, meaning, creative action)
  identifiable but not structurally separable
- Principles and positioning documents describe a broader
  vision than what was built — reconciliation done in
  spl3/analysis/

## What spl4 Achieved

- Protocol stack: 37 registered operations across 13
  protocols, all following the uniform factory pattern.
  Map-based resolution with longest prefix match.
- Eight implementation patterns (P1-P8) bridging principles
  to code. Mechanically verifiable, no exceptions needed.
- Cascading references (repository facet): read-only overlay,
  copy-on-write, hidden contexts, structural access control.
  66 tests proving the mechanism.
- Process standards: build cycle, requirements, evaluation,
  quality gates formalised as referenceable documents with
  checkable requirements. Evaluator checks compliance
  through cascading references.
- Git protocol: status, checkpoint (AI-assisted commit
  messages), log, changelog. Version control as substrate
  protocol.
- Compound operations: move (git mv), copy (read + create +
  git add). Git-aware operations that stage for checkpoint.
- Self-hosting: the tools built in spl4 (checkpoint,
  evaluate, test) were used to build spl4 itself.
- 89 tests, all passing. Test harness as protocol.
- Three documentation tiers established: background (origins,
  principles), logical (pillar docs), operational (process,
  patterns).

## What spl4 Taught

- Patterns compound autonomy. Once P1-P8 documented,
  mechanical to apply. Process + evaluator + patterns
  together reduced human intervention progressively
  across 18 projects.
- The autonomy target clarified: physical fully AI
  autonomous, logical interactive collaborative.
  Collaboration on meaning is Splectrum's nature, not
  a limitation.
- The lifecycle model is per-concern, not per-iteration:
  POC → pilot → production. Concerns at different
  maturity levels coexist, like organs developing at
  different rates.
- Memory bloats when it carries implementation detail.
  Memory should orient, not catalogue. Detail on demand.
- Tailoring context to task is a meaning concern
  (Splectrum's domain), not an optimisation problem.
  Focus over efficiency.
- Protocol naming matters: git/ not mc.git/ (external
  substrate, not data model). Naming reflects what
  something is, not where it lives in the stack.

## What spl4 Left Open

- Discover protocol: tailored meaning extraction. Produces
  efficient data blocks for agent consumption. Needs dev
  environments first. Seed captured in mycelium/discover.md.
- Dynamic resources: a resource that declares "generate me
  using protocol X." Extends mc.core/read. Related to
  discover but distinct.
- Cascading references (meaning facet): links as visible
  connections, AI-controlled knowledge hierarchies. The
  repository facet is proven; the meaning facet is not.
- Changelog ownership: does changelog belong to the resource
  (follows on move) or the path (stays put)?
- Stream consumers for execution data: scoped but never
  needed. No pressing use case emerged.
- Memory management through mycelium tools: discussed but
  not implemented. Memory as references, not flat file.

## The Transition to spl5

spl4 proved the protocol stack works in a monolithic repo.
All 37 operations share .spl/proto/. Protocols can't be
developed, tested, or deployed independently.

spl5 diversifies. Spawn creates dev environments (model/
as subrepo), packages protocols, deploys them as
independent repos. Like cells specialising into organs —
each repo develops at its own pace, autonomous once
deployed.

The aim: an embryonic hub repo retaining the wider picture,
and cast-off dev env repos that are standalone, functional,
autonomous — but not yet mature. They work, they're
independent, they're not yet production.

## Source

- spl2 analysis trail: spl2/analysis_and_refocus/ (15 docs)
- spl3 analysis trail: spl3/analysis/ (6 docs + seed)
- spl3 project evaluations: spl3/projects/01-09/EVALUATION.md
- spl4 project evaluations: spl4/projects/01-18/EVALUATION.md
- spl4 critical review: spl4/review/REVIEW.md
