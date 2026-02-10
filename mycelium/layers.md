# Layers

A context composed from stacked layers. Each layer
contributes structure and capabilities. The stack
is resolved top-down — nearest distance wins.

## Behavior

- Read: check local layer first, fall through to
  layers below until found
- Write: always goes to the local mutable layer
- Delete: marks in local layer (does not modify
  lower layers)
- List/flatten: merged view across all layers

## Capability composition

A layer can provide tools. The tools active on a
context are determined by its layer composition.
Tool names are atomic — just the capability name.
The layer stack resolves which implementation is
invoked.

Adding a layer adds its capabilities. A local
layer can override an implementation from below.
Structure is behavior: the layers you compose
determine what the context can do.

## Relationship to types

Context types (like exploratory-repo) are expressed
as layer compositions rather than as inheritance.
A git-repo layer provides git capabilities. An
exploratory layer adds project structures and tools.
Compose them and the context has both.
