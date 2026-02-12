# Context

## Current: Bootstrap Chain

Implementing the Mycelium bootstrap chain. Boot mc.proto resolves protocols using direct file access. mc.xpath resolves locations. spl orchestrates: boot mc.proto → mc.xpath → context-view invocation. Proves the bootstrap architecture end to end.

See projects/06-mycelium-api/

## Completed

Context View Embedding — embedded context-view tool into exploratory-repo type with scan/haiccer/persist pipeline and moved memory to git-tracked .claude/rules/
  See projects/03-context-view/EVALUATION.md

Context Metadata — defined `.spl/` metadata structure, protocol mounting, addressing model, and spl runner for protocol invocation
  See projects/04-context-metadata/EVALUATION.md

File-Level Metadata — extended `.spl/` structure to file-level contexts and project instance type definitions
  See projects/05-file-metadata/EVALUATION.md

Pillar Structure — created four top-level buckets (mycelium, splectrum, haicc, exploratory-repo) with vocabulary and content for each
  See projects/02-pillar-structure/EVALUATION.md

Initialization — initialized spl4 from seed, created git repo (splectrum/spl4), placed documents, separated reference code, installed working memory
  See projects/01-initialization/EVALUATION.md
