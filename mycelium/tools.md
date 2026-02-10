# Tools

A tool is a capability invocable from a context.
Tools are atomic — proprietary internals, compatible
boundaries. The tool name is the interface. The
layer stack provides the binding to an implementation.

## Invocation

Tools are invoked from the context they operate on.
The context's structure determines which tools are
available. No global registry.

## Resolution

When a tool is invoked, the context's layer stack
is traversed to find the implementation. Nearest
distance wins — a local layer can override an
implementation from a layer below.

## Portability

The same tool name can have different implementations
in different contexts. A `context-view` tool on an
exploratory-repo produces project timelines. A
`context-view` on a different context type could
produce something entirely different. The name is
the capability contract. The layer provides the
realization.
