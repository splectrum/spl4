# Discover (Direction)

Tailored meaning extraction — producing efficient data
blocks that entities consume as fast-access local copies.
Not about real-time semantic access, but about preparing
the right information in the right form for the task.

Thinking captured from spl4. Not yet built. Premature
until protocols have their own dev environments.

## The Meaning Ladder

Each layer adds meaning over the one below:

1. **Physical** — bytes on disk (filesystem)
2. **Structural** — records in contexts (mc.core)
3. **Formatted** — typed content (mc.raw: utf-8, json, buffer)
4. **Filtered** — views over structure (mc.data, mc.meta)
5. **Temporal** — history over time (git)
6. **Semantic** — understanding on demand (discover)

Layers 1-5 answer "give me data in a particular shape."
Layer 6 answers "help me understand this."

## Discover as Protocol

Operations defined by kind of understanding, not by
data mechanics:

- `read` — content (thin wrapper, through discover lens)
- `list` — what's here
- `summary` — distill into essence (may use intelligence)
- `changelog` — what happened over time (delegates to git)
- `compare` — how does this differ from that
- `context` — orient me in this space

Extensible by meaning: adding an operation means adding
a new kind of understanding. The mechanism (Claude, git,
raw read) is implementation detail.

## Agent Context Model

An agent's world is defined by:
- **Context** (cascading references) — what's visible
- **Protocol** (conversation layer) — what's doable
- **Required detail** (task references) — what's loaded

Agents are focused. Information is contextualized.
Self-contained as possible. Task preparation resolves
dependencies before the agent starts.

## Focus Over Efficiency

The goal is not the smallest context or cheapest run.
The goal is focus: the entity sees exactly what it needs
for the task, in the form it needs it. Nothing more,
nothing less.

Efficiency is the consequence, not the objective.
Tailoring context to task is a meaning concern — deciding
what information is relevant, how it should be prepared,
what level of detail serves this specific purpose. That
is Splectrum's domain: expressing the right meaning for
the right moment.

## The Reverse-Derive Principle

Don't maintain separately, derive from source. Summaries
are derived, not cached. Changelogs are derived from git.
Understanding is always fresh because always derived.
Cost is compute. Payoff is coherence.

## Open Questions

- Who writes required detail sections? Human? Build cycle?
- One conversation protocol with many operations, or
  multiple protocols (discover, dev, evaluate)?
- How does task preparation work mechanically?
- Dynamic resources in mc.core/read: when does a resource
  declare "generate me using protocol X"?
