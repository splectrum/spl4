# Spawn Protocol

A context can seed a new context, carrying forward
proven knowledge while allowing the new context to
make its own structural decisions.

## Requirements

1. The origin context critically examines itself before
   spawning — what was proven, what wasn't, what the
   actual state is

2. A seed is assembled: documents, reference code, and
   working memory — information, not structure. Working
   memory lives in `.claude/rules/` as part of the repo
   structure (git-tracked, portable)

3. Preparation is minimal — create the target, place the
   seed, add instructions for the initializing entity

4. Initialization is the target's responsibility — it
   reads the seed and makes its own structural decisions

5. The seed is not a template — it is a package of
   information that initialization interprets

6. The initialization is itself the first project —
   decisions are documented
