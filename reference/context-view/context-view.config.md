# context-view — Configuration

Structural assumptions currently hardcoded in source.
This document declares them as data assets — the seed
of future configurable schema.

## Repository Structure

```
root_marker: CLAUDE.md
projects_dir: projects/
output_file: CONTEXT.md
```

## Project Structure

```
evaluation_file: EVALUATION.md
skip_dirs: [node_modules, dist, .git]
skip_files_prefix: [.]
keep_dotfiles: [.gitignore]
```

## Evaluation Sections

Headings expected in EVALUATION.md for content extraction:

```
learnings: ["What We Learned", "What We Confirmed"]
summary: ["The Primitive", "Carry Forward"]
external: ["Changes Outside"]
```

## Timeline

```
timeline_start: <!-- TIMELINE:START -->
timeline_end: <!-- TIMELINE:END -->
entry_start: <!-- ENTRY:{key}:START -->
entry_end: <!-- ENTRY:{key}:END -->
```

## Output Structure

The generated CONTEXT.md contains:

```
sections:
  - name: State
    mutable: true
    content: [documents list, in-progress projects]
  - name: Timeline
    mutable: false
    content: [completed project entries, append-only]
```
