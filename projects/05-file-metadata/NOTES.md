# Notes

## Mycelium as Protocol Bundle

Mycelium is not a monolithic API — it is a bundle of
protocols. Each capability is a protocol:

    mc.core(...)         — core data API (list, read, write, ...)
    mc.protoResolve(...) — resolve a protocol executable

Extensible by adding protocols. No core changes needed
for new capabilities.

## spl as Boundary Validator

spl is the user-facing invocation layer. It wraps
mc.<proto> calls. spl owns schema validation at the
boundary:

    user → spl (validate) → mc.<proto> (trusted)

Validation at the boundary, trust internally. Tools
receive validated input and need no defensive code.
Internal mc calls between protocols are trusted.

The protocol config.json can carry input/output schema.
spl reads the schema, validates the invocation, then
calls through to mc.

## Architecture

    spl              — boundary: resolve, validate, invoke
    mc.<proto>       — trusted API, protocol bundle
    .spl/proto/      — protocol configs + schemas + implementations

spl is thin: resolve protocol, validate against schema,
call mc. mc is the engine: data operations, protocol
resolution, traversal. Both are extensible via protocols.

## Connection to File-Level Metadata

The schemas spl validates against reference the same
`.spl` metadata structures being defined in this project.
Protocol config describes expectations (input/output
schema), spl validates data matches before invocation.

## Wildcard Child References

For contexts where all children conform to the same
type, use `*` in the reference path (e.g., `*/.spl`).
Exact syntax to settle during Mycelium API work —
the concept is agreed.

## Reference Key Naming

Use `"context"` not `"spl"` for references to file
metadata. The referenced thing is a full context
(meta/ + proto/), not just metadata.
