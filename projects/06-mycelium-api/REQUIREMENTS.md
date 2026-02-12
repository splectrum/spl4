# Project 06: Bootstrap Chain — Requirements

## Goal

Implement the Mycelium bootstrap chain. Boot mc.proto
resolves protocols using direct file access. mc.xpath
resolves locations. spl orchestrates: boot mc.proto →
mc.xpath → context-view invocation. Proves the bootstrap
architecture end to end.

## Architecture

    spl (entry point, repo root)
      → boot mc.proto (direct file access)
        → resolve mc.xpath
        → resolve repo root via mc.xpath
        → resolve context-view
        → invoke context-view

## Deliverables

### mc.proto boot

The one bootstrap protocol. Direct file access only.
Assumes filesystem substrate and cwd = repo root.

- resolve(root, name) → protocol config
- Reads .spl/proto/{name}/config.json
- Returns { run, help, ... } — whatever config contains
- Stateless. root passed as parameter.
- Registered at repo root in .spl/proto/

### mc.xpath

Location resolver. Stateless. Resolved through boot
mc.proto (registered in .spl/proto/).

- resolve(root, path) → Location
- Location: path, address, state (real|error), type
  (file|directory), isContext
- Context detection: directories with .spl/ are contexts
- Filesystem substrate today
- No factories, no closures. Root as parameter.

### spl rework

Entry point. Always invoked at repo root.

- Sets root from git repo root (environment)
- Uses boot mc.proto to resolve mc.xpath
- Uses mc.xpath to resolve repo root location
- Uses boot mc.proto to resolve requested protocol
- Invokes the protocol executable
- Thin boundary — validate input, delegate execution

## Protocol Registration

Protocols are registered in .spl/proto/ as directories
with config.json. Boot mc.proto reads these directly.

    .spl/proto/
      mc.xpath/config.json       — xpath protocol
      context-view/config.json   — existing protocol
      mc.proto/config.json       — self-registration

mc.proto registers itself — the proper (non-boot)
implementation will be resolved through this entry
once mc.raw exists.

## Implementation

- TypeScript, ES modules
- Stateless functions — no factories, no instances
- root passed as parameter, not captured in closure
- mc.proto boot uses node:fs directly
- mc.xpath uses node:fs (filesystem substrate today)
- spl is a thin shell script or node entry point
  that wires the chain

## Deferred

- mc.raw (five operations — next project)
- mc.data, mc.meta (namespace filters)
- Proper mc.proto (uses mc.raw, substrate-agnostic)
- Session object (root + cwd formalised)
- Virtual location resolution
- Non-filesystem substrates

## Quality Gates

- Boot mc.proto resolves mc.xpath from .spl/proto/
- Boot mc.proto resolves context-view from .spl/proto/
- mc.xpath resolves repo root as real directory context
- mc.xpath resolves a file as real file context
- mc.xpath errors on non-existent path
- spl invokes context-view through the bootstrap chain
- Context-view produces CONTEXT.md (existing behaviour)
- No factories or closures — all protocols stateless
