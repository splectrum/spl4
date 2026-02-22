# Requirements: Project

What must be true about a project folder.

## R1: Lives in projects/
Each project is a numbered directory under projects/.
Format: `projects/N-short-name/`.

## R2: Contains REQUIREMENTS.md
Every project has a REQUIREMENTS.md written before
implementation begins.

## R3: Contains EVALUATION.md
Every completed project has an EVALUATION.md written
after implementation.

## R4: Self-contained scope
A project's scope is defined by its REQUIREMENTS.md.
Work outside that scope belongs to a different project.

## R5: References declare dependencies
If a project needs data from outside its folder, it
uses cascading references (.spl/data/refs.json). No
implicit dependencies on paths outside the project.

## R6: Previous projects are sealed
A project is sealed once committed with its evaluation.
Changes to sealed projects are not made — corrections
belong to the current project.

## R7: External changes documented
Changes to files outside the project folder are listed
in EVALUATION.md under "External Changes."
