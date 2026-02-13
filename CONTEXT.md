# Context

## Current: spl as Protocol

Promote spl to a protocol with a boot operation.
Establish mc.proto resolve as the universal resolution
mechanism, persisted in the module cache. Migrate
context-view to the new registration format. Project
in progress.

See projects/12-spl-protocol/

## Completed

Protocol Resolution — Enabled named protocol lookup via
cached map. Removed filesystem walk, operation-level
registration, factory pattern for operator binding.
  See projects/11-protocol-resolution/EVALUATION.md

mc.exec + Test Protocols — Execution store protocol with
global JSONL log and local snapshots. Tested with stats
(read-only at root) and tidy (state-changing at container).
Path-based calling convention and resolution algorithm.
  See projects/10-exec-and-protocols/EVALUATION.md

Documentation Consolidation — Organized architecture
decisions into mycelium model documents. Protocols,
bootstrap, scope isolation, execution with design/proven
distinction. Added 9 vocabulary terms, updated existing docs.
  See projects/09-documentation/EVALUATION.md

Dogfood — Environment-based session, namespace filters
(mc.data excludes .spl, mc.meta scopes to metadata).
Context-view updated to use mc protocol stack. First
real consumer validation.
  See projects/08-dogfood/EVALUATION.md

mc.raw + Proper mc.proto — Five primitive operations
(list, read, create, update, del). Format layer on
mc.core. Boot → proper transition. Stateless protocols.
  See projects/07-mc-raw/EVALUATION.md

Bootstrap Chain — Three minimal pieces proved end-to-end
invocation. Boot mc.proto with direct file access,
mc.xpath for location resolution, spl orchestration.
Stateless design, single bootstrap seam.
  See projects/06-bootstrap-chain/EVALUATION.md

File-Level Metadata — Extended `.spl` to files. Immutable
defaults in parent referenced via children, type definition
for project instances. Uniform schema across file/directory.
  See projects/05-file-metadata/EVALUATION.md

Context Metadata — `.spl` structure with meta/ and proto/,
protocol mounting, XPath addressing. Repos describe
themselves through stored metadata.
  See projects/04-context-metadata/EVALUATION.md

Context View Embedding — Three-step pipeline (scan,
haiccer, persist) produces CONTEXT.md. Working memory
moved to .claude/rules/. Scan reports structure,
entity produces meaning.
  See projects/03-context-view/EVALUATION.md

Pillar Structure — Four top-level buckets. Mycelium
(data world), Splectrum (language world), HAICC
(creative world), exploratory-repo (context type).
Structures three-pillar concerns as first-class.
  See projects/02-pillar-structure/EVALUATION.md

Initialization — Placed seed documents at root, created
repo structure, installed working memory, prepared
projects/ directory. spl4 ready for first real project.
  See projects/01-initialization/EVALUATION.md
