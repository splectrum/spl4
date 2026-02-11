# Notes

## Haiccer output validation

The haiccer (entity step) produces variable output —
sometimes adds commentary, code fences, or drops
projects. Current workaround: post-processing cleanup
in persist.ts.

Proper evolution: instruct the haiccer with requirements
that include evaluation criteria (quality gates). Validate
the output against those gates before persisting. If
validation fails, iterate or flag.

This applies the evaluation concept to the tool's own
output — the same pattern used for project evaluation.
Requirements → quality gates → evaluation → accept/reject.

## Carry forward items

- Context metadata structure
- Mycelium invocation mechanism
- Context-level requirements (structural fitness)
- Haiccer output validation via requirements + evaluation
