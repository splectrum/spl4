# Context

## Current: Project 13 — Evaluator Protocol

Quality gate evaluation is operational. The evaluator runs as a protocol operation (evaluate/run, evaluate/status), executes a four-step data-triggered pipeline, and produces structured evaluation reports. First live run on project 12: 5 of 7 PASS, 2 FAIL. One FAIL correctly identified that protocol operations hardcode mc module paths instead of resolving through doc.map. The evaluator itself is working as designed.

See projects/13-evaluator/

## Completed

Project 12: spl as Protocol — spl promoted to a registered protocol with boot entry point, module cache persistence for code, non-enumerable exec doc properties for data, map.json on disk for cross-process state. All protocols refactored to async factories importing mc via execDoc.root. SPL_ROOT read once by boot, never by operations.
  See projects/12-spl-protocol/EVALUATION.md

Project 11: Protocol Resolution — Proto map builder scans all .spl/proto/ directories, caches to map.json, resolves protocol names to context path using longest prefix match. Operation-level registration replaces protocol-level. Factory pattern eliminates per-operation cli.js files. Named resolution works: `spl tidy scan` instead of fully qualified paths.
  See projects/11-protocol-resolution/EVALUATION.md

Project 10: mc.exec + Test Protocols — Execution store protocol with global log (JSONL source of truth) and local snapshots. Two test protocols validate the stack: stats (read-only at root, collects file/line/byte counts), tidy (state-changing at projects/, scans and cleans transient artifacts). Path-based calling convention enables single mechanism for global, local, and cross-scope protocol resolution.
  See projects/10-exec-and-protocols/EVALUATION.md

Project 09: Documentation Consolidation — Four new model documents (protocols.md, bootstrap.md, scope.md, diagrams.md) organize architecture decisions from projects 06–08. Protocol stack, stateless design, session concept, bootstrap sequence, ancestor chain resolution, scope isolation all moved from project archaeology into Mycelium model. Sections distinguish proven (implemented) from designed (architecture settled, not yet built).
  See projects/09-documentation/EVALUATION.md

Project 08: Dogfood — SPL_ROOT from environment eliminates root parameter from all protocol APIs. mc.data and mc.meta namespace filters (thin layers on mc.core). context-view updated to consume mc protocols — first real protocol stack consumer. scan.js uses mc.data.list and mc.raw.read, proves the stack works for practical tools.
  See projects/08-dogfood/EVALUATION.md

Project 07: mc.raw + Proper mc.proto — mc.core (five primitives, opaque bytes, stable contract) separated from mc.raw (format interpretation, pre-semantic layer). Proper mc.proto uses mc.core, substrate-agnostic. spl bootstrap transitions from boot to proper via module cache. Boot entry point used once, then proper resolves all subsequent protocols.
  See projects/07-mc-raw/EVALUATION.md

Project 06: Bootstrap Chain — mc.proto boot (direct file access, one-time), mc.xpath (stateless location resolver), spl orchestration (boot → resolve → invoke). Stateless protocol design proved end-to-end. One bootstrap seam (boot mc.proto with direct fs), everything else composed. Protocol config currently unstructured, schema deferred.
  See projects/06-mycelium-api/EVALUATION.md

Project 05: File-Level Metadata — File-level .spl contexts for repo root documents and project instance type definitions. Uniform meta/proto schema across file, directory, and type-definition contexts. Immutable defaults in parent, local overrides only when needed. Structure ready for Mycelium API work. Current limit: hypothesis not yet tested by running tools against it.
  See projects/05-file-metadata/EVALUATION.md

Project 04: Context Metadata — .spl/ metadata structure (meta/ and proto/ subdirectories), protocol mounting, XPath-style addressing, spl runner script (eight lines, all text lives in config.json). One identity across conventions and runtime (.spl as namespace). Protocols as self-contained directories. JSON as uniform .spl/ format. Deployed vs development separation.
  See projects/04-context-metadata/EVALUATION.md

Project 03: Context View Embedding — context-view tool with three-step pipeline (scan, haiccer, persist). Report what exists rather than expect specific structures. Use AI entity for description rather than hardcoded parsing. Moved working memory to .claude/rules/ (in-repo, git-tracked, portable). Scan provides data, haiccer provides meaning — this pattern repeated in evaluator.
  See projects/03-context-view/EVALUATION.md

Project 02: Pillar Structure — Four top-level buckets (mycelium/, splectrum/, haicc/, exploratory-repo/) make the three pillars structurally visible. Pillar directories are perspectives, not partitions. Vocabulary is local to each bucket. Exploratory-repo is a context type. Three-level pattern: Splectrum concept → HAICC requirement → exploratory-repo structure. Reference code separate from projects at root.
  See projects/02-pillar-structure/EVALUATION.md

Project 01: Initialization — Phase 4 of spawn protocol. Git repository created (splectrum/spl4 on GitHub). Seed documents placed at root. Reference code in reference/. Projects directory structure created. Working memory installed to auto memory location. Seed scaffolding removed. spl4 ready for first real project.
  See projects/01-initialization/EVALUATION.md
