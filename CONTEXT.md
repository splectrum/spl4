# Context

## Current: Dogfood — Complete the protocol bundle and update context-view

spl4's integration mission is reaching its first real test. The Mycelium protocol stack is built (mc.core, mc.raw, mc.xpath, proper mc.proto). This project simplifies the APIs by moving session state (SPL_ROOT) to the environment, adds namespace filters (mc.data for user data, mc.meta for metadata), and updates context-view to consume the protocol stack instead of direct filesystem access. First practical validation of the three-layer architecture.

See projects/08-dogfood/

## Completed

Protocol Bootstrap Chain — Stateless bootstrap with one direct-file-access seam, proper protocols via mc.raw, mc.xpath resolves locations.
  See projects/06-mycelium-api/EVALUATION.md

mc.core + mc.raw + Proper mc.proto — Five primitive operations, format interpretation layer, substrate-agnostic protocol resolution.
  See projects/07-mc-raw/EVALUATION.md

File-Level Metadata — Repo root and project instance metadata contexts, document specs, uniform schema across all context types.
  See projects/05-file-metadata/EVALUATION.md

Context Metadata — `.spl` directory structure, protocol mounting, `spl` runner, XPath-style addressing model.
  See projects/04-context-metadata/EVALUATION.md

Context View Embedding — Three-step pipeline (scan, haiccer, persist), memory moved to .claude/rules/, tool reports structure without expecting it.
  See projects/03-context-view/EVALUATION.md

Pillar Structure — Three pillars made structurally distinguishable (mycelium/, splectrum/, haicc/, exploratory-repo/), vocabulary and principles organized by concern.
  See projects/02-pillar-structure/EVALUATION.md

Initialization — spl4 scaffolded from seed, CLAUDE.md and principles placed at root, reference code separated, memory installed.
  See projects/01-initialization/EVALUATION.md
