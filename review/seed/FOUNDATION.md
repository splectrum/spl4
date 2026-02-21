# Foundation

What we know coming out of spl4, refined through review.
Base layer for the spl5 seed.

## What Splectrum Is

Splectrum is a living meaning system. Three pillars:

- **Mycelium** — the data world. A layered context model:
  records in contexts, recursive, with operations over
  them. The repository structure. How data is organised,
  stored, accessed, layered.

- **Splectrum** — the meaning world, and the name of the
  whole because meaning is central. Everything exists to
  serve meaning. The language, concepts, requirements,
  quality gates — what makes data meaningful. Data is
  shaped by meaning.

- **HAICC** — the creative world. The dynamic process:
  build cycle, spawn, evaluation. Where capabilities
  live — the translation of meaning into tools on the
  ground. Meaning is enacted through creative action.

The relationship: data (mycelium) is shaped by meaning
(splectrum) through creative action (haicc).

## How We Work

- Entity: any participant. Human, AI, process, capability.
- Maximum beneficial autonomy within clear lines.
- Technology decisions are AI's domain.
- Build, don't plan endlessly. If wrong, fix it.
- Meaning first. KISS in realisation.
- Collaborative on the logical side (scope, meaning,
  design, direction). Autonomous on the physical side
  (structure, code, environments, testing, deployment).

## Lifecycle Model

Three stages, applied per concern — not per iteration:

- **POC** — discrete projects, exploration. Prove that
  concepts work standalone. Each new capability enters
  at POC regardless of which iteration introduces it.
- **Pilot** — proper SDLC. Dev environments, packaging,
  install, deploy. Concepts move from proven to
  operational.
- **Production** — maturity. Versioning, evolution,
  governance. Operational system becomes a governed,
  evolving product.

Stages coexist: one concern at production, another at
POC, a third at pilot. Like organs developing at
different rates within a body.

## What spl4 Proved

spl4 was the POC iteration. 18 projects proved:

- The mycelium context model works in practice (37
  operations, 89 tests, uniform patterns)
- Protocols compose through map-based resolution
- Cascading references enable scoped views with
  copy-on-write
- The system self-hosts (tools built in spl4 helped
  build spl4)
- Eight implementation patterns (P1-P8) enable
  mechanical verification
- Process standards + evaluator compound autonomy

The gap between abstract concepts and running code
is narrowed — concepts are proven, not complete.

## Autonomy Target

- **Physical**: fully AI autonomous — structure, code,
  environments, testing, deployment, packaging.
  Given clear requirements, the system executes
  independently.
- **Logical**: interactive collaborative — scope,
  meaning, design, direction, creative decisions.
  Collaboration on meaning is Splectrum's nature,
  not a limitation.

## Protocol Groups

**Mycelium** — the base data layer (mc.proto, mc.xpath,
mc.core, mc.raw, mc.data, mc.meta, mc.exec). 28
operations. Currently the only pillar with structured
protocols.

**Repo management** — git, stats, context-view. How the
repo sees and manages itself. Ancillary foundation.

**Quality** — evaluate, test. How the repo verifies
itself. Ancillary foundation.

**Bootstrap** — spl, tidy. Housekeeping.

As the system matures, protocols will align to their
pillar. Splectrum protocols when meaning gets structured.
HAICC protocols when creative process gets structured.

## Thinking Captured, Not Built

**Discover** — tailored meaning extraction. Not "get me
data" but "extract this specific aspect from this data."
Needs dev environments first. Seed in mycelium/discover.md.

**Dynamic resources** — abstraction of data origin.
A resource that looks local but is generated/resolved
from elsewhere. Extends mc.core/read.

**Focus over efficiency** — tailoring context to task is
a meaning concern. Smallest context and cheapest run are
consequences of getting the meaning right, not objectives.
Design principle, not a feature to build.

## spl5 Direction

**Primary:** spawn + dev environments. Develop protocols
in isolation, deploy as independent repos.

**Mechanism:** model/ as subrepo within parent. Parent
tooling develops and tests the candidate. Deploy makes
it autonomous. Governance only during candidacy — once
deployed, independent.

**Aim:** retain embryonic hub repo. Cast off embryonic
dev env repos — standalone, functional, autonomous but
not yet mature (no versioning, no full SDLC). They work,
they're independent, they're not yet production.

**Roadmap:** discover (once dev environments exist),
pillar protocols, cross-repo maturity.

Spawn is differentiation — like cells specialising into
organs. Each repo develops its own maturity at its own
pace. The system grows by diversifying, not by
accumulating.
