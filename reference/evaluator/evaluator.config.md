# evaluator — Configuration

Structural assumptions currently hardcoded in source.
This document declares them as data assets.

## Project Structure

```
requirements_file: REQUIREMENTS.md
source_dirs: [src/]
transient_context: .eval/
```

## Requirement Formats

```
formats:
  r_numbered:
    heading: ### R{n}: {title}
    gates_section: ## Quality Gates
    gates_format: bullet list (- gate text)
  sections:
    heading: ## {section title}
    gates_format: numbered items (1. gate text)
  natural_language:
    format: free prose
    status: planned (not yet implemented)
```

## Transient Context Files

```
artifacts: artifacts.md
requirements: requirements.json
prompt_pattern: {id}.prompt.md
result_pattern: {id}.result.json
report: report.md
```

## Result Schema

Per-requirement result (R{n}.result.json):

```
type: array
items:
  gate: string (the quality gate text)
  pass: boolean
  explanation: string
```

Future enrichment (not yet implemented):

```
items:
  gate: string
  pass: boolean
  explanation: string
  eval.operator: string
  eval.timestamp: string
  eval.source: { prompt: string, artifacts: string }
  eval.triggeredBy: string
```

## Skip Directories

```
skip: [node_modules, .git, .eval, dist]
```
