# Autonomy and the Translation Gap

## The Observation

Full autonomy within the capability/implementation domain
is not yet achievable. The primary bottleneck is not
capability itself — it is the translation from logical
principles to implementation patterns.

An AI entity can:
- Follow a pattern once shown
- Apply it mechanically across many files
- Understand a principle abstractly

The gap is the creative step between principle and pattern:
when a new situation appears to conflict with a principle,
finding the implementation that preserves the principle
rather than relaxing it. The default instinct is "this is
special" instead of "how do I make this not special."

## Evidence

**spl2:** Heavy hand-holding required. Principles and
patterns were both emerging simultaneously. The friction
between human steering and AI implementation was high,
but it laid the foundations for clearer principles.

**spl3:** More autonomy. Principles clearer. But the
translation layer — how principles become coding patterns
— was still implicit. Each decision required human
intervention at the principle-to-pattern boundary.

**spl4, project 14:** The uniform factory refactoring
exposed the gap precisely. Example: mc.exec/create
bootstraps the exec doc it would normally receive. The
principle says "one pattern, no exceptions." The AI
defaulted to an exception. The human saw the
pattern-consistent solution instantly: create a seed doc
with the minimum fields the factory needs.

The issue was not misunderstanding the principle. It was
failing to translate the principle into the specific
implementation pattern for the edge case.

## The Translation Layer

Principles live in the logical domain. Code lives in the
physical domain. Between them sits a translation layer:
**structural patterns** — named, requirements-bearing
descriptions of how principles manifest in code.

    Principle (logical)
        ↓ translation
    Pattern (structural)
        ↓ application
    Code (physical)

Without explicit patterns, every implementation decision
requires an entity that can perform the translation.
Currently, that entity is primarily the human. With
explicit patterns, the translation is captured and
reusable — any entity that understands the pattern can
apply it.

This is a Splectrum concern. Splectrum is the language
pillar — it translates meaning into structure. The pattern
collection is Splectrum operating on the implementation
domain itself.

## The Path Forward

1. **Capture patterns as they emerge.** Each time a
   principle-to-implementation decision is made, name the
   pattern and write its requirements.

2. **Make patterns evaluable.** Quality gates reference
   named patterns. The evaluator checks code against
   pattern requirements, not just functional requirements.

3. **Compound autonomy.** As the pattern library grows,
   the translation gap narrows. More situations have
   explicit patterns. Fewer require human intervention
   at the translation boundary.

This is the same virtuous cycle that drives the whole
system: meaning → structure → evidence → evolved meaning.
The patterns themselves are subject to the cycle — they
get refined through use.

## Process Adoption Roadmap

Process standards (process/) define how the build cycle
works. Making agents actively follow them is itself an
autonomy progression:

**1. Evaluator checks process compliance.** The feedback
loop. Results are measured against process standards.
The agent has reason to consult process docs — not
because it's told to, but because evaluation happens.
Creates natural flow through incentive.

**2. Convention enforced by structure.** Naming
conventions, structural signals, predictable layout.
The agent naturally finds what it needs at the moment
it needs it. Grows from experience with evaluation.

**3. Protocol-driven build cycle.** Process becomes
executable. Structure helps when natural flow is not
restricted — it removes the need to remember without
forced guardrails. The agent is guided through steps,
not commanded. Earned through maturity from steps 1–2.

CLAUDE.md pointers ("read this before starting") are
explicitly discarded — that's prompt-driven, not
structural. The goal is natural flow: the environment
makes the right behavior obvious, evaluation confirms
it, protocol removes friction.

## Relationship to HAICC

Section 3.2 of PRINCIPLES.md: "Maximum beneficial
autonomy — the boundary between autonomous and
collaborative shifts as capabilities evolve."

The pattern library is the mechanism by which the
boundary shifts. Each captured pattern moves one class
of implementation decision from collaborative to
autonomous. The human's role concentrates increasingly
on principle evolution and pattern recognition — the
places where genuine value is added.
