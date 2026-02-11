# Project 03: Context View Embedding

## Full Scope

Everything identified for embedding the context-view
tool into the exploratory-repo type:

1. Context metadata structure — define how a context
   stores its metadata (mounted tools, properties)

2. Mycelium invocation — a top-level command that reads
   context metadata and invokes the appropriate tool

3. Context-level requirements — structural fitness
   criteria for the repo root and project contexts
   (what must be present for the tool to work)

4. Context-view tool adaptation — read CLAUDE.md for
   orientation, process projects/ for timeline and
   state, strip hardcoded vocabulary

5. Move memory to .claude/rules/ — in-repo, git-tracked,
   portable, automatically loaded by Claude Code

6. Update spawn protocol — memory now lives in repo
   structure, not external location

## This Project

Items 4 and 5: adapt the context-view tool and move
memory into the repo. These are immediately useful and
don't depend on the metadata/invocation infrastructure.

The tool stays directly invocable for now (CLI). Tool
mounting through Mycelium invocation carries forward.

## Requirements (This Project)

### R1: Move memory to .claude/rules/

Working memory moves from ~/.claude/projects/.../memory/
to .claude/rules/ in the repo. Git-tracked, portable,
automatically loaded by Claude Code.

### R2: Context-view reads CLAUDE.md

The tool reads CLAUDE.md for intro and mission. No
hardcoded vocabulary or descriptions — the content
comes from the repo.

### R3: Context-view processes projects/

The tool scans projects/ for timeline and current state.
Within each project it reads REQUIREMENTS.md and
EVALUATION.md when present. This already works in the
reference tool.

### R4: Evaluation section headings

The tool matches our actual evaluation heading
conventions (Carry Forward, What We Learned, Changes
Outside This Project). The reference tool partially
misses these.

### R5: Output is a context description

The tool produces CONTEXT.md at repo root. Mutable
sections regenerated on each sync. Immutable timeline
entries append-only.

### R6: Reference code untouched

The reference implementation in reference/context-view/
remains as prior art. The working tool is a new copy.

## Carry Forward

- Context metadata structure
- Mycelium invocation mechanism
- Context-level requirements (structural fitness)
