# Install — spl5

Manual install from spl4. The first spawn is itself POC.

## Steps

1. Create new repo:
   ```
   mkdir spl5 && cd spl5
   git init
   ```

2. Copy entire install package contents into repo root:
   ```
   cp -r <path-to-install>/* <path-to-install>/.* spl5/
   ```

3. Make spl wrapper executable:
   ```
   chmod +x spl
   ```

4. Build the proto map:
   ```
   ./spl spl init
   ```

5. Verify:
   ```
   ./spl test run
   ```

6. Initial commit:
   ```
   git add .
   git commit -m "spl5: initial install from spl4 seed"
   ```

## What's Included

**Boot infrastructure:**
- `spl` — bash wrapper (discovers root, builds seed doc)
- `.spl/spl.mjs` — boot entry point
- `package.json` — `"type": "module"`

**Protocols (41 operations, 14 protocols):**
- mc.xpath, mc.core, mc.raw, mc.data, mc.meta,
  mc.exec, mc.proto — base data layer (28 ops)
- git — changelog, checkpoint, log, status (4 ops)
- stats — collect (1 op)
- context-view — scan, sync (2 ops)
- evaluate — run, status (2 ops)
- test — run + 10 test suites (1 op)
- spl — init (1 op)
- tidy — scan, clean (2 ops)

**Documentation:**
- CLAUDE.md — project framing (spl5 mission, scope)
- background/ — ORIGINS, POSITIONING, PRINCIPLES
- mycelium/ — 13 docs (model, patterns, protocols, ...)
- splectrum/ — 6 docs (autonomy, evaluation, ...)
- haicc/ — 3 docs (evaluator, spawn, vocabulary)
- process/ — 9 docs (build cycle, requirements, ...)
- FOUNDATION.md, PROTOCOLS.md, SPAWN-PROCESS.md

**Memory:**
- .claude/rules/memory.md — empty, for task memory
- Auto-memory starts fresh (new project path)

## Post-Install

- Evaluate and tidy are project-scoped (registered
  at projects/). Create a projects/ context if needed:
  ```
  mkdir -p projects/.spl/proto/evaluate/run
  mkdir -p projects/.spl/proto/evaluate/status
  mkdir -p projects/.spl/proto/tidy/scan
  mkdir -p projects/.spl/proto/tidy/clean
  ```
  Then copy config.json files from spl4's
  projects/.spl/proto/ or re-register.

- Run `./spl spl init` after any registration changes.

## Notes

- This is a manual copy. The spawn protocol (spl5
  deliverable) will automate this process.
- All protocols are proven and tested in spl4
  (89/89 tests passing at time of seed).
- The test suites will need adjustment if repo
  structure changes significantly.
