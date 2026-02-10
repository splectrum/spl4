# References

A context can reference other contexts. References
are the mechanism for composition — building complex
structures from simpler ones without copying data.

## Dimensions

### Horizontal

References to contexts at the same level. A local
context references a remote context (another repo,
an API, a service). The referenced context is
navigable through the same path structure.

### Vertical (Layers)

A context can be layered on top of another context.
Read falls through — local layer first, then the
layer below. Write goes to the local mutable layer.
Nearest distance applies to data, not just metadata.

Layers compose capabilities. Each layer can bring
structures, tools, and behavior. The composed stack
determines what the context is and what it can do.

## Navigation

Path-based, XPath-style. One addressing scheme that
works regardless of whether the target is local, in
a layer below, or behind a horizontal reference.
The path structure also serves as namespace for
tools and capabilities.
