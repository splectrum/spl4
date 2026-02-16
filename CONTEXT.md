# Context

## Current: Project 14 — Uniform Factory Pattern

All protocol operations refactored to the uniform factory pattern (P1): default export async factory taking execDoc, returning bound operator. Config.json reduced to `{ "module": "..." }`. Every MC module split into one-file-per-operation. Boot (spl.mjs) no longer uses env vars — receives seed doc as JSON argument from bash wrapper. mc.proto/resolve is now a registered operation (bootstrapped directly by boot). stdout/stderr capture added to boot. Test harness built as protocol operation (test/run) with 7 test suites (35 tests). Implementation patterns (P1-P7) documented in mycelium/patterns.md with quality gates in splectrum/quality-gates.md.

Status: code complete, needs test verification after mc.proto/resolve change + PATH fix + commit.

See projects/14-bug-fixes/

## Completed

Project 13: Evaluator Protocol — Quality gate evaluation operational. Evaluator runs as protocol operation (evaluate/run, evaluate/status), four-step data-triggered pipeline, structured evaluation reports. First live run on project 12: 5 of 7 PASS, 2 FAIL. One FAIL correctly identified hardcoded mc module paths.
  See projects/13-evaluator/

Project 12: spl as Protocol — spl promoted to registered protocol with boot entry point, module cache persistence for code, non-enumerable exec doc properties for data, map.json on disk for cross-process state. All protocols refactored to async factories importing mc via execDoc.root.
  See projects/12-spl-protocol/EVALUATION.md

Project 11: Protocol Resolution — Proto map builder scans all .spl/proto/ directories, caches to map.json, resolves protocol names to context path using longest prefix match. Operation-level registration replaces protocol-level. Factory pattern eliminates per-operation cli.js files.
  See projects/11-protocol-resolution/EVALUATION.md

Project 10: mc.exec + Test Protocols — Execution store protocol with global log and local snapshots. Two test protocols validate the stack: stats (read-only at root), tidy (state-changing at projects/).
  See projects/10-exec-and-protocols/EVALUATION.md

Project 09: Documentation Consolidation — Four model documents organize architecture decisions from projects 06-08.
  See projects/09-documentation/EVALUATION.md

Project 08: Dogfood — SPL_ROOT from environment, mc.data/mc.meta namespace filters, context-view consumes mc protocols.
  See projects/08-dogfood/EVALUATION.md

Project 07: mc.raw + Proper mc.proto — mc.core separated from mc.raw. Proper mc.proto uses mc.core. spl bootstrap transitions from boot to proper via module cache.
  See projects/07-mc-raw/EVALUATION.md

Project 06: Bootstrap Chain — mc.proto boot, mc.xpath, spl orchestration.
  See projects/06-mycelium-api/EVALUATION.md

Project 05: File-Level Metadata — .spl contexts for repo root documents and project instance type definitions.
  See projects/05-file-metadata/EVALUATION.md

Project 04: Context Metadata — .spl/ metadata structure, protocol mounting, XPath-style addressing, spl runner.
  See projects/04-context-metadata/EVALUATION.md

Project 03: Context View Embedding — context-view tool with scan/haiccer/persist pipeline.
  See projects/03-context-view/EVALUATION.md

Project 02: Pillar Structure — Four top-level buckets making three pillars structurally visible.
  See projects/02-pillar-structure/EVALUATION.md

Project 01: Initialization — Phase 4 of spawn protocol. Git repository created, seed documents placed.
  See projects/01-initialization/EVALUATION.md
