# Context

## Current: mc.raw + Proper mc.proto

Implementing five stateless operations (list, read, create, update, delete) on repository structure, and a proper mc.proto protocol that uses mc.raw instead of direct file access. Upgrading the spl bootstrap to transition from boot to proper mc.proto, proving the upgrade path.

See projects/07-mc-raw/

## Completed

Bootstrap Chain — Proved stateless protocol architecture with boot mc.proto, mc.xpath resolver, and spl orchestration. See projects/06-mycelium-api/EVALUATION.md

File-Level Metadata — Extended `.spl` metadata model to document specs with full meta/proto structure for repo-root and project-instance files. See projects/05-file-metadata/EVALUATION.md

Mycelium API — Established pillar structure with four top-level buckets (mycelium, splectrum, haicc, exploratory-repo) and vocabulary/concept docs for each. See projects/02-pillar-structure/EVALUATION.md

Context View Embedding — Implemented scan/entity/persist pipeline for context descriptions, moved working memory to .claude/rules/ as in-repo git-tracked record. See projects/03-context-view/EVALUATION.md

Context Metadata — Defined `.spl` metadata namespace, protocol mounting, addressing model, and spl runner. Establishes context type and mounted tools at repo root. See projects/04-context-metadata/EVALUATION.md
