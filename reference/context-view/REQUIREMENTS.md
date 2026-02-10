# 05_context_fix — Requirements

CONTEXT.md must work as a cold-start orientation document.
A fresh entity reading only CONTEXT.md should understand
what this project is, where we are, and what to do next.

## Content

1. Opens with a 2-3 sentence introduction: what is Splectrum,
   what are the three pillars, what is spl3 doing.
2. Key vocabulary defined inline or as a brief glossary:
   entity, context, record, Mycelium, Splectrum, HAICC, TDC.
3. Current conceptual state: what we understand now, not just
   what files exist.
4. What's next: the carry-forward from the latest completed
   project is surfaced prominently.
5. In-progress project described with purpose, not just
   file count.
6. Reading order: which docs to read first for deeper
   orientation.

## Timeline (existing behaviour)

7. Completed project entries remain immutable in the timeline.
8. Mutable sections regenerated on every sync.
9. New completed projects detected and appended.

## Tool

10. The context-view sync command produces all of the above.
11. No manual editing of CONTEXT.md required for standard use.
