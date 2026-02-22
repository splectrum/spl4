# Context Management

Physical realization of the discover protocol's
principles. How entities get the right context for
the task at hand.

## The Operation

Discover creates **nutshells** — compressed, focused
representations of contexts. Any Mycelium context can
be nutshelled: a repo, a project, a document, a
protocol, a record.

Context management then:

1. **Select** — decide which contexts are in play
2. **Weight** — determine relative importance of each
3. **Assemble** — build a prepared context from
   weighted nutshells

This operates on Mycelium contexts in general, not
just AI prompts. The same operation serves any
consumer: an agent receiving a prompt, a human
reviewing a project, a process needing scoped data,
a cross-repo operation.

The industry calls the prompt-specific version
"context engineering." Discover is broader — it
works within the Mycelium model, where contexts
have structure, metadata, and traversal semantics.
The formal model makes context management meaningful
regardless of who consumes the result.

## Context Lifetimes

Assembled context has different lifetimes depending
on what it serves:

**Persistent** — repo identity. What this is, how we
work. Changes rarely. Always present.

**Task** — working state for the current effort.
Active decisions, what's being built. Evolves with
the work, spans checkpoints.

**Session** — operational notes for the current
checkpoint cycle. Accumulates during work, cleared
at checkpoint boundaries.

Each lifetime answers a different question:
- Persistent: what are we?
- Task: what are we doing?
- Session: what just happened?

Lifetimes apply to the assembled context, not to
specific files. A file is one possible container.
Prompt injection is another. The lifetime governs
freshness and cleanup, not storage.

## Agent Context (One Consumer)

When an agent is launched, it receives assembled
context — not the full system state, but weighted
nutshells relevant to its task. This is one
application of the general operation.

**Assembly:**
1. Determine scope from task definition
2. Nutshell the relevant contexts
3. Weight by relevance to the specific task
4. Inject into the agent's prompt

The agent receives a complete, focused context. It
doesn't discover at runtime what it should have known
at launch.

**After completion:**
- Results flow back to the calling context
- Session-lifetime context is disposable
- Decisions and outcomes may promote to task lifetime
- Nothing persists unless explicitly promoted

**Nesting:** A sub-agent gets its own assembled
context, not its parent's full state. The parent's
discover operation selects and weights what the
child needs.

## Checkpoint Lifecycle

A checkpoint is a commit boundary. Context lifetimes
respond:

- **Persistent** — unchanged
- **Task** — updated if task state changed
- **Session** — cleared. The checkpoint captures the
  work; scratch notes served their purpose.

Stale context from previous cycles should not
influence current decisions. Freshness is managed
by lifetime, not by manual cleanup.

## Current Physical Mapping

In the current Claude Code environment, the three
lifetimes map to available files:

- Persistent → CLAUDE.md (loaded every turn)
- Task → .claude/rules/memory.md (loaded every turn)
- Session → auto-memory (~/.claude/projects/...)

These files could equally be kept empty and context
pushed directly into prompts. The files are a
convenience, not the model.

## Open Questions

- Nutshell granularity: who decides what level of
  compression a context gets?
- Weighting: explicit (declared in task definition)
  or derived (from context distance, task type)?
- Cross-repo: how does discover nutshell a context
  in a different repository?
