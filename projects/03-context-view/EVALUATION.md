# Project 03: Context View Embedding — Evaluation

## What Was Built

A context-view tool with a three-step pipeline:

1. **Scan** (deterministic) — collects repo structure:
   CLAUDE.md, projects with their meaningful records
   (REQUIREMENTS.md, EVALUATION.md). Reports what exists,
   does not expect specific structures.

2. **Haiccer** (entity) — reads the scan output and
   produces a freestyle context description. Headline +
   summary for the current project (magnifying glass),
   headline + reference for completed projects.

3. **Persist** (deterministic) — cleans and writes
   CONTEXT.md.

Also moved working memory from ~/.claude/projects/
(machine-local) to .claude/rules/memory.md (in-repo,
git-tracked, portable, auto-loaded by Claude Code).

## Key Decisions

### Report, don't expect

The tool reports on whatever structure it encounters
rather than expecting specific file layouts or heading
conventions. This makes it immediately general — any
exploratory repo with projects/ and CLAUDE.md gets a
context description.

### Entity for description, not parsing

Using a haiccer (AI entity) for the description step
means the tool doesn't need hardcoded section heading
extraction or template rendering. The entity reads and
summarizes. Quality depends on the documents being
clear, which is where we want the pressure.

### Scan provides the data, haiccer provides the meaning

The deterministic scan collects structure and content.
The entity interprets it into a coherent description.
As Mycelium structures gain meaning (stored metadata,
typed contexts), the scan will do more and the haiccer
will do less — handling loose ends and wrapping up.

### Memory is a repo record

Working memory moved into .claude/rules/ — it's now
a git-tracked, portable record in the repo context.
Any entity cloning the repo gets the memory. The spawn
protocol was updated to reflect this.

## What We Learned

### The scan/entity split follows the evaluator pattern

Deterministic steps (scan, persist) with an entity
step in between (haiccer). Same architecture as the
evaluator: prepare → translate → evaluate → report.
This is becoming a general pattern for Splectrum tools.

### Entity output needs requirements + evaluation

The haiccer produces variable output — commentary,
code fences, dropped entries. Current fix is cleanup
code. The proper evolution is requirements with quality
gates for the entity step itself: define what good
output looks like, validate before persisting.

### Quality lives in the data, not in the tool

The tool reports, it doesn't interpret structure. When
quality depends on the documents being clear rather
than on clever parsing in the tool, the responsibility
for quality lives in the visible data world — where it
can be inspected, improved, and evaluated by any entity.
If quality were embedded in the tool's parsing logic,
it would be hidden and proprietary. This way the data
is accountable, not the tool.

### The tool's quality improves when the data improves

The tool is only as good as what it reads. As we bake
meaning into Mycelium structures (metadata, typed
contexts), the deterministic scan will extract richer
information and the haiccer will have more to work
with and less to invent.

### Context-view is a narrow window

The tool reads CLAUDE.md and projects/ — that's its
scope. Infrastructure (pillar directories, reference
code) is referenced by CLAUDE.md, not scanned. This
keeps the tool focused and general.

## Carry Forward

- Context metadata structure — how a context stores
  mounted tools and properties
- Mycelium invocation — invoke tools through context
  metadata rather than directly
- Context-level requirements — structural fitness
  criteria (evaluable)
- Haiccer output validation — requirements + quality
  gates for the entity step
- As Mycelium matures, shift work from haiccer to scan

## Changes Outside This Project

- Created .claude/rules/memory.md (in-repo memory)
- Updated auto memory to point to in-repo version
- Updated haicc/spawn.md to reference .claude/rules/
- Updated .gitignore (added .context-view/, package-lock.json)
- Generated CONTEXT.md at repo root
