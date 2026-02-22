# Autonomy

## Target

Physical fully AI autonomous — structure, code,
environments, testing, deployment. Logical interactive
collaborative — scope, meaning, design, direction.

Collaboration on meaning is Splectrum's nature, not a
limitation. The human concentrates on principle evolution
and pattern recognition. The AI handles everything that
can be captured in pattern and structure.

## The Translation Gap

The gap between principles and implementation is the
primary bottleneck. Not capability itself — the creative
step of translating a principle into a pattern for a new
situation.

    Principle (logical)
        -> translation
    Pattern (structural)
        -> application
    Code (physical)

Without explicit patterns, every implementation decision
requires an entity that can perform the translation.
With explicit patterns, the translation is captured and
reusable — any entity that understands the pattern can
apply it.

## Mechanism: Patterns and Gates

Named structural patterns bridge the gap. Each captured
pattern moves one class of implementation decision from
collaborative to autonomous. Quality gates make patterns
evaluable — the evaluator checks code against pattern
requirements, not just functional requirements.

Two kinds of gates:
- Functional gates — does it do what requirements say?
- Pattern gates — does it follow the structural patterns?

Pattern gates catch "will it compose?" failures. Code
that works but violates patterns creates debt that
compounds.

## Evidence from spl4

**Project 14 (uniform factory):** Exposed the gap
precisely. mc.exec/create bootstraps the exec doc it
would normally receive. Principle: "one pattern, no
exceptions." AI defaulted to an exception. Human saw
the pattern-consistent solution: seed doc with minimum
fields. After the pattern was named and documented (P1),
the remaining 36 operations were refactored without
intervention.

**Projects 15-17 (evaluator, test, context-view):**
Pattern gates applied systematically. Eight patterns
(P1-P7 + lib convention) verified across all protocols.
AI followed patterns independently once they were
explicit and evaluable.

**Project 18 (compound operations):** New operations
(move, copy) built entirely within the pattern framework.
No pattern violations. Evidence that the translation
layer works for novel code, not just refactoring.

**Trajectory across iterations:**
- spl2: Heavy hand-holding. Principles emerging.
- spl3: More autonomy. Translation still implicit.
- spl4: Patterns explicit and evaluable. Translation
  gap narrowing measurably.

## Process Adoption

Three stages, earned not prescribed:

1. **Evaluator checks compliance.** The feedback loop.
   Results measured against standards. Creates natural
   flow through incentive.

2. **Convention enforced by structure.** Naming, layout,
   predictable signals. The agent finds what it needs
   when it needs it.

3. **Protocol-driven build cycle.** Process becomes
   executable. Structure guides without commanding.
   Earned through maturity from steps 1-2.

The goal is natural flow: the environment makes the
right behavior obvious, evaluation confirms it.
