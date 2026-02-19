# Discover: The Semantic Layer

Thinking captured from project 17 session. Seed for
next project.

## The Meaning Ladder

Each layer adds meaning over the one below:

1. **Physical** — bytes on disk (filesystem, fs_cascading)
2. **Structural** — records in contexts (mc.core)
3. **Formatted** — typed content (mc.raw: utf-8, json, buffer)
4. **Filtered** — views over structure (mc.data, mc.meta)
5. **Temporal** — history over time (git)
6. **Semantic** — understanding on demand (discover)

Layers 1-5 answer "give me data in a particular shape."
Layer 6 answers "help me understand this."

## Two Access Tiers

- **Direct tools**: fast, cheap, local filesystem. For
  essentials — files you know, paths you have.
- **Discover**: mycelium's file tools. Richer data
  environment — references resolve, contexts scope,
  content gets prepared. More expensive, but the data
  is more useful when you get it.

Cost matches need. Essentials accessed cheaply (constant
need). Peripheral information accessed richly (when
needed, needs to be ready to use).

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

## Three Kinds of Protocol

1. **Infrastructure** (mc.*) — data mechanics, internal.
   Gets buried once working. Agents never call directly.
2. **Tool** (git, evaluate, test) — specific capabilities.
   Used by higher layers.
3. **Conversation** — agent's interface to the system.
   Operates within a scoped context. Speaks in terms of
   intent, not mechanism. Discover is the first of these.

## MC Protocols Get Buried

Once implemented, mc.* protocols are not accessed directly.
Higher-level protocols (discover, dev, evaluate) use them
internally. Like TCP under HTTP — the plumbing disappears
behind protocols that speak intent.

## Agent Context Model

An agent's world is defined by:
- **Context** (cascading references) — what's visible
- **Protocol** (conversation layer) — what's doable
- **Required detail** (task references) — what's loaded

Agents are focused. Information is contextualized.
Self-contained as possible. Task preparation resolves
dependencies before the agent starts.

## Mix and Match, Not Either/Or

An agent working on a task might:
1. Read REQUIREMENTS.md directly (local, known path)
2. `discover summary` of a referenced project (remote)
3. Read a specific function (local, raw tool)
4. `discover changelog` for recent changes (derived)

Each call uses the right mechanism. Direct when raw is
sufficient. Protocol when protocol adds value (resolution,
digestion, preparation).

## Memory Implications

- **Static memory**: always loaded, minimal orientation
- **Discover tier**: accessed through mycelium when
  task demands, in the form that's most useful

Memory becomes a bootstrap pointer to capability.
Detail loaded on demand, not carried every turn.

## Required Detail via Reference

Task prompts include a required detail section:
```
## Required Detail
ref: /mycelium/patterns.md
ref: /process/req-project.md
```

System resolves these (through cascading references)
and injects content before the agent sees the prompt.
The agent gets a complete context without discovering
at runtime.

## The Reverse-Derive Principle

Don't maintain separately, derive from source. Summaries
are derived, not cached. Changelogs are derived from git.
Understanding is always fresh because always derived.
Cost is compute. Payoff is coherence.

## Connection to Capstone

When spawned repos are autonomous, discover is how they
understand themselves and each other. Parent discovers
child. Child discovers its referenced resources. Discovery
is the common language for self-orientation across
repositories.

## Open Questions

- Who writes required detail sections? Human? Build cycle?
- One conversation protocol with many operations, or
  multiple protocols (discover, dev, evaluate)?
- How does task preparation work mechanically?
- Dynamic resources in mc.core/read: when does a resource
  declare "generate me using protocol X"?
