# Project 07: mc.raw + Proper mc.proto — Requirements

## Goal

Implement mc.raw — five stateless operations on repository
structure. Implement proper mc.proto using mc.raw instead
of direct file access. Upgrade spl bootstrap to transition
from boot to proper mc.proto. Proves the boot → proper
upgrade path works.

## Architecture

    spl
      → boot mc.proto (direct file access, one-time)
        → resolve proper mc.proto
          → proper mc.proto (uses mc.raw)
            → resolve mc.xpath, mc.raw, any protocol

    mc.raw uses mc.xpath internally (co-deployed bundles)

## Deliverables

### mc.raw

Five stateless operations on raw repository structure.
No semantic filtering — truly raw. Uses mc.xpath
internally for path resolution.

- list(root, path, options?) → Location[]
  Depth-controlled flattening through non-context dirs.
  depth 0 = immediate children (default). depth -1 = infinite.
  No filtering — includes dotfiles, .spl, everything.
- read(root, path) → Buffer
  Files only. Opaque bytes.
- create(root, parentPath, key, content?) → Location
  File if content, directory if not. On parent.
- update(root, path, content) → void
  Existing files only.
- del(root, path) → void
  Real entries only. Recursive for directories.

All take root as first parameter. Stateless.
Deployed to .spl/proto/mc.raw/.

### Proper mc.proto

Uses mc.raw.read to read .spl/proto/{name}/config.json.
Substrate-agnostic (goes through mc.raw, not direct fs).
Same interface as boot: resolve(root, name) → config.

Deployed to .spl/proto/mc.proto/resolve.js alongside
existing boot.js.

### spl upgrade

Boot mc.proto used once — to resolve proper mc.proto.
Proper mc.proto handles all subsequent resolution.
Boot → proper transition is explicit in spl.mjs.

## Implementation

- Plain JS, ES modules (matching project 06 pattern)
- mc.raw imports mc.xpath directly (co-deployed bundles)
- Proper mc.proto imports mc.raw directly
- Boot remains sync. Proper resolve is async (mc.raw is async)
- spl.mjs uses top-level await for proper mc.proto

## Deferred

- Ancestor chain resolution (no non-root protocols yet)
- Scope isolation / path rebasing
- mc.data, mc.meta namespace filters
- Session formalisation

## Quality Gates

- mc.raw.list returns children of a directory
- mc.raw.list flattens through non-context directories
- mc.raw.list depth control works (0, 1, -1)
- mc.raw.read returns file content as Buffer
- mc.raw.create makes files and directories
- mc.raw.update overwrites file content
- mc.raw.del removes entries
- Proper mc.proto resolves protocols using mc.raw
- spl boots with boot mc.proto, switches to proper
- spl context-view still works through the full chain
