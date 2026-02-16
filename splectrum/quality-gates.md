# Quality Gates

Checkable assertions derived from requirements. A
quality gate translates expressed intent into something
that can be verified — the point where meaning becomes
testable.

Quality gates are not separate from requirements.
They are requirements made precise enough to evaluate.
The translation from requirement to gate is itself a
Splectrum operation — understanding meaning well enough
to assert fitness.

Quality gates are entity-neutral. Any entity that
understands the language can check them.

## Two Kinds of Gates

**Functional gates** — does the code do what the
requirements say? These are project-specific, written
in each project's REQUIREMENTS.md.

**Pattern gates** — does the code follow the mandatory
implementation patterns? These are cross-project,
defined in `mycelium/patterns.md`. Every project is
subject to pattern gates.

Pattern gates are structural. They verify that the
translation from principle to implementation was done
correctly — not just that the feature works, but that
it works in the right way.

## Pattern Gate References

Project quality gates can reference named patterns:

    ## Quality Gates
    - Follows Uniform Factory pattern (P1)
    - Follows Config as Indirection pattern (P2)
    - All cross-protocol access through resolve (P7)

The evaluator checks these against the pattern
requirements in `mycelium/patterns.md`. The pattern
definition provides the criteria.

## Why Pattern Gates Matter

Functional gates catch "does it work?" failures.
Pattern gates catch "will it compose?" failures.

Code that works but violates patterns creates technical
debt that compounds. A factory with a special case works
today but breaks the uniformity that enables cascading
references, spawned repos, and override resolution
tomorrow.

Pattern gates are the mechanism by which implementation
autonomy improves. Each pattern gate that passes without
human intervention is evidence that the translation
from principle to code is working.
