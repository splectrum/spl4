# Applying Quality Gates

How to write and check quality gates in practice.

## Two Kinds

**Pattern gates** verify structural correctness — does the
code follow the mandatory implementation patterns? These
are cross-project. Every project is subject to them.

**Functional gates** verify behavioral correctness — does
the code do what the requirements say? These are
project-specific.

Pattern gates catch "will it compose?" problems.
Functional gates catch "does it work?" problems. Both
are needed.

## Writing Pattern Gates

Reference patterns by P-number from mycelium/patterns.md.
In REQUIREMENTS.md:

    ### Pattern gates
    - P1 (Uniform Factory) — any new/changed operations
    - P2 (Config as Indirection) — any new config.json
    - P7 (Resolution Through Map) — cross-protocol access

Only list patterns that apply to this project. If a
project doesn't create operations, P1 and P2 don't apply.
Read the pattern definitions to understand what each
requires.

## Writing Functional Gates

Derive from requirements. Phrase as pass/fail assertions:

    ### Functional gates
    - References resolve transparently through mc.xpath
    - List merges all layers, highest priority wins
    - Write creates locally, shadowing the reference

Each gate should be checkable by looking at test results
or code. Avoid vague gates ("code is clean"). A gate
that can't clearly pass or fail is not a gate.

## Checking Gates

During evaluation, check each gate and record the
evidence:

**Pattern gates:** The test harness includes structural
tests (general suite) that verify P1, P2, P7
automatically. For other patterns, cite the code or
design decision that satisfies the pattern.

**Functional gates:** Cite test names, test counts, or
specific code behavior. "mc.core/list merges local and
reference — refs suite, test passes" is evidence.
"It works" is not.

## The Test Suite as Gate Evidence

The test harness (`spl test run`) is the primary source
of gate evidence. Tests that verify structural patterns
(general suite) provide pattern gate evidence. Tests that
verify behavior (protocol suites) provide functional
gate evidence.

When writing tests during build, consider which gates
they provide evidence for. A well-designed test suite
makes evaluation straightforward — most gates can be
checked by pointing at test results.

## When Gates Fail

A failing gate is not necessarily a project failure.
It may indicate:
- A requirement that needs updating
- A pattern that doesn't apply as expected
- An edge case that needs discussion

Record the failure honestly in the evaluation. Don't
hide it, don't force it to pass. The evaluation captures
what happened — the next project handles what to do
about it.
