# Implementation Patterns

Named structural patterns that translate principles into
implementation requirements. Each pattern bridges a
logical principle to its physical realization.

Patterns are mandatory. Code that violates a pattern
fails evaluation — the violation means either the code
is wrong or the pattern needs evolving.

---

## P1: Uniform Factory

**Principle:** One pattern, no exceptions.

**Pattern:** Every registered operation is a single file
with a default export. The default export is an async
factory that takes an exec doc and returns a bound
operator.

**Requirements:**
- One file per operation
- Single default export per file
- Factory takes execDoc as its only parameter
- Factory returns a bound operator function
- No named exports for operation functions
- Edge cases resolved within the pattern, not around it

**Edge case — bootstrap:** When a factory creates the
thing it normally receives (e.g. mc.exec/create creates
exec docs), create a seed object with the minimum fields
the factory needs. The factory binds to the seed. The
pattern is preserved.

**Violation examples:**
- Named export factory with function name in config
- Factory that takes different parameters for "special" cases
- Operation that skips the factory and exports a direct function

---

## P2: Config as Indirection

**Principle:** Code may not be local. The config is the seam.

**Pattern:** Each operation has a config.json containing
only the module path. No function names, no format
references, no behavioral flags.

**Requirements:**
- config.json contains `{ "module": "<path>" }`
- No other fields in config.json
- Module path is root-relative
- Default export means no function name needed

**Rationale:** Config exists for indirection — spawned
repos, cascading references, P2P, parent overrides child.
If config contained function names or behavior, every
override would need to replicate the full signature.
Module path only means any module that exports a default
factory is a valid replacement.

---

## P3: Lib Convention

**Principle:** Shared internals are not registered operations.

**Pattern:** When operations within a protocol share code,
the shared code lives in `lib.js` within the protocol
directory. It is not registered, not a factory, not a
default export.

**Requirements:**
- Shared protocol internals in `<protocol>/lib.js`
- lib.js uses named exports (not default)
- lib.js is not registered in the proto map
- lib.js has no config.json

**Rationale:** Registration means "addressable operation."
Internal utilities are not addressable — they are
implementation details of a protocol. Naming them `lib.js`
makes the convention discoverable and consistent.

---

## P4: Three Channels

**Principle:** Separate concerns of output by nature, not by choice.

**Pattern:** Operations produce output through three
channels. The operator doesn't choose — it naturally
uses all three. Boot infrastructure handles separation.

**Requirements:**
- **Data state:** writes to mycelium (persistent, addressable)
- **Execution state:** return values and doc properties (exec doc, faf)
- **Realtime state:** stdout/stderr (captured by boot, transparent to operator)
- Operators write to console normally — unaware of capture
- No format functions — boot outputs result as JSON
- No operator-level output formatting

**Violation examples:**
- Format function exported alongside factory
- Operator choosing how to present results
- Operator writing to a "log" instead of stdout

---

## P5: Minimize Conditionals

**Principle:** Set data appropriately so code paths are uniform.

**Pattern:** Instead of branching for special cases,
normalize the data so the same code path handles all
cases. Prefer setting defaults that make conditionals
unnecessary.

**Requirements:**
- No conditionals for root vs non-root (use `.` as prefix at root, `join` normalizes it away)
- No conditionals for "has feature" vs "doesn't have feature" — set the data appropriately
- Edge cases handled by data normalization, not by branching

**Example:** POV prefix is `.` at repo root. `join('.', path)` = `path`. No conditional needed to check "am I at root?"

---

## P6: Point of View

**Principle:** You can only see what is in front of you.

**Pattern:** Resources are relative to CWD (the point of
view). Functionality (modules, proto map) is root-relative.
Paths are context-relative primary keys.

**Requirements:**
- `doc.prefix` set to CWD relative to root (`.` at root)
- `doc.resolvePath(path)` converts POV-relative to absolute mc path
- Resource paths cannot escape above the POV
- Functionality resolution always uses root-relative paths
- Output paths are POV-relative (what the caller sees)

---

## P7: Resolution Through Map

**Principle:** The map is the single source of truth.

**Pattern:** Operations access other operations through
`execDoc.resolve(key)`. No direct imports between
protocols. The map mediates all cross-protocol access.

**Requirements:**
- All cross-protocol dependencies resolved via `execDoc.resolve`
- No `import` of another protocol's files from an operation
- Intra-protocol imports (e.g. lib.js) are allowed — same protocol
- Resolved operators are cached — same key returns same operator
- Boot is the only code that imports operation modules directly (it bootstraps resolve)

**Rationale:** Direct imports hardcode the physical location.
Resolution through the map means the location can change
(cascading references, spawned repos, overrides) without
changing the consumer.

---

## Pattern Evolution

Patterns are not permanent. They evolve through the same
cycle as everything else:

1. A principle-to-implementation gap is observed
2. A pattern is named and its requirements written
3. Code is evaluated against the pattern
4. Evidence from use refines the pattern

A pattern that creates more complexity than it resolves
should be simplified or retired. The test is always: does
this pattern make the principle realizable with less
human intervention?
