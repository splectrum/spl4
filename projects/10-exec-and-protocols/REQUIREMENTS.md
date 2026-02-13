# Project 10: mc.exec + Test Protocols

## Goal

Implement the execution store protocol and two test
protocols (stats, tidy) that validate the mc stack
and prepare the ground for ancestor chain resolution,
scope isolation, and the evaluator.

## mc.exec

1. Global execution log at `/.spl/exec/log` is the
   source of truth. State-safe — atomic entries, no
   partial writes. Suitable for future locking.

2. Log entries are raw facts: uid, protocol, context,
   parent uid (if nested), timestamp, status. Lazy
   evaluation — log sufficient information efficiently,
   derive everything else on demand.

3. Local execution store at `<context>/.spl/exec/`
   holds transient working state. Created only when
   a state-changing operation actually runs at that
   context. Working files are protocol-specific.

4. mc.exec.create writes to the global log first,
   then creates the local working directory. Source
   of truth before working state.

5. Pipeline model: well-defined input → output at
   every level (global and per-step). Presence/absence
   of step outputs determines progress. Recovery is
   re-running from where outputs are missing — no
   special recovery logic.

6. Nesting via parent uid reference in the global log.
   Execution tree, not flat list.

7. mc protocols never register executions. Only
   non-mc protocol operations that may change data
   state register — determined at design time
   (compile-time), not runtime.

8. Retention follows existing principles: soft delete,
   hard delete, compaction. The exec store is data
   subject to the same lifecycle as any other record.

## projects/ as Context

9. `projects/` becomes a Mycelium context (gets .spl/).
   Container for project instances. Protocols can be
   registered here.

## stats Protocol

10. Registered at root (global protocol). Read-only —
    does not register executions.

11. Takes a target path argument. Counts files, lines,
    records in the target context. Prints to stdout.

12. Simple, verifiable output. Validates mc.data and
    mc.raw for reading across contexts.

## tidy Protocol

13. Registered at `projects/` (container protocol).
    State-changing — registers executions via mc.exec.

14. Finds transient/generated artifacts in project
    instances (.context-view/, build artifacts, old
    exec instances).

15. Reports what it finds (dry run). Cleans on request
    (actual run). Both modes register execution — the
    operation may change state by definition.

16. Validates local protocol registration at non-root
    contexts and mc.exec integration.

## Constraints

- All protocols invoked with explicit path arguments
  for now. Ancestor chain resolution comes in project 11.
- No scope isolation yet — paths are repo-root-relative.
- Functional approach: lazy evaluation, no anticipation,
  log raw facts and derive on demand.
