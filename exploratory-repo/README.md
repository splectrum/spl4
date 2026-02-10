# Exploratory Repository

A context type for iterative, project-based exploration.

Derives from git repository: a mutable context with
immutable changelog (git log). Tools may use git
capabilities directly (history, diffing, branching).

## Structures

- root-marker — identifies the context root
- project — a sub-context with shape and lifecycle
- requirements — expressed intent for a project
- evaluation — fitness judgement and learnings
- context-description — self-generated orientation

## Tools

- context-view — produces the context description
