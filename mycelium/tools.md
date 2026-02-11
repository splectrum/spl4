# Tools

A tool is a capability invocable from a context.
Tools are atomic — proprietary internals, compatible
boundaries. The tool name is the interface. The
layer stack provides the binding to an implementation.

## Protocol Binding

Tools are bound to contexts via protocol entries in
`.spl/proto/`. The protocol name is the logical
interface. The value is the capability binding —
where and how the tool is realized.

    .spl/proto/context-view → ./tools/context-view

## Invocation

Tools are invoked through the `spl` runner.

    spl <protocol> [args...]

The runner resolves the protocol at the current
context and hands off. Arguments are protocol-specific.

Fully qualified paths address a protocol directly —
the context is implicit in the path.

See `addressing.md` for the full invocation model.

## Resolution

When a protocol is invoked, the context's layer stack
is traversed to find the capability binding. Nearest
distance wins — a local layer can override a binding
from a layer below.

## Portability

The same protocol name can have different capability
bindings in different contexts. A `context-view`
protocol on an exploratory-repo produces project
timelines. A `context-view` on a different context
type could produce something entirely different. The
name is the capability contract. The binding provides
the realization.
