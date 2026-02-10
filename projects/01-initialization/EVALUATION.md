# Project 01: Initialization — Evaluation

## Decisions Made

### Document Placement
- `seed/CLAUDE.md` → root `CLAUDE.md` (replaces bootstrap version)
- `seed/PRINCIPLES.md` → root `PRINCIPLES.md`
- `seed/POSITIONING.md` → root `POSITIONING.md`
- `seed/ORIGINS.md` → root `ORIGINS.md`

Rationale: These are the working documents for spl4. They
belong at root where they're immediately visible and where
CLAUDE.md is expected.

### Reference Code
- `seed/reference/` → root `reference/`
- Three tools: context-layer, context-view, evaluator

Rationale: Reference code is prior art from spl3, not
projects built in spl4. Keeping it at root as `reference/`
makes it accessible without cluttering `projects/`. It's
read-only context — the spl4 projects will build new code
that may draw from these but won't modify them.

### Seed Directory
- Removed after extraction.

Rationale: The seed is scaffolding. Once its contents are
placed, the directory serves no purpose. Keeping it would
create confusion about which version of each file is
authoritative.

### Working Memory
- `seed/MEMORY.md` installed to auto memory location
  (`~/.claude/projects/.../memory/MEMORY.md`)

Rationale: This is the persistent working memory that
carries across sessions. It contains the operational
knowledge distilled from spl3.

### Repository
- GitHub: splectrum/spl4 (private, org account)
- Branch: main
- Remote: origin

### .gitignore
- node_modules, dist, .env, OS files
- Standard for a TypeScript project (reference code is TS)

## Structure Created

```
spl4/
  CLAUDE.md          — working instructions
  PRINCIPLES.md      — three-pillar principles
  POSITIONING.md     — landscape positioning
  ORIGINS.md         — lineage through spl3
  reference/
    context-layer/   — flat API, traversal, storage
    context-view/    — CONTEXT.md generator
    evaluator/       — evaluation pipeline
  projects/
    01-initialization/
      REQUIREMENTS.md
      EVALUATION.md
```

## Assessment

The initialization is mechanical — read seed, place files,
create repo. The only real decisions are placement and what
to do with reference code. Both choices follow from the
principles: keep it simple, documents at root, reference
code separate from projects, remove scaffolding.

spl4 is ready for its first real project.
