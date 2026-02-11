# Notes

## Next: File-Level Metadata (Project 05)

Tackle `.spl` at the file (record) level — specifically
for tool input, internal requirements, and output.
The context-view tool has implicit expectations about
files (CLAUDE.md, REQUIREMENTS.md, EVALUATION.md).
Making these explicit via file-level `.spl` metadata
turns implicit structure into visible, evaluable data.

After that: integrate Mycelium core API usage into
the tools.

## Two-layer metadata design

Both layers git-tracked. Immutable = type defaults.
Mutable = instance config. The immutable layer holds
what the context type prescribes. The mutable layer
holds what this specific instance overrides. Same
nearest-distance principle — instance overrides type.
