# Context View

The repository context describes itself to new entities.

## Requirements

1. The repository produces a self-description from its
   own structure and content

2. The description orients: what this is, what state
   it's in, what comes next

3. The description stays current — it reflects the
   present state, not a past snapshot

4. Completed history is immutable — only the present
   and future-facing parts change

5. No manual maintenance — the context describes itself,
   it is not described by someone

## Tool

Atomic tool. Proprietary internals (direct filesystem
access).

### Input

- root-marker record
- projects context
- Within each project context: requirements record,
  evaluation record (both optional)
- Root-level document records

### Output

- context-description record

### Internal

The tool requires the following structures to exist
and navigates them directly:

- Root marker identifies the context root
- Projects are sub-contexts within the projects context
- Evaluations contain extractable sections (learnings,
  carry-forward, external changes)
- Root documents are markdown records at context root
