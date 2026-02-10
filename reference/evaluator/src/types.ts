/**
 * Evaluator logical layer — pure data structures.
 *
 * No imports. The first Splectrum-layer types.
 * Mycelium stores; Splectrum interprets.
 */

/** A requirement extracted from natural language. */
export interface Requirement {
  id: string;
  title: string;
  text: string;
  gates: string[];
}

/** An artifact to evaluate against requirements. */
export interface Artifact {
  path: string;
  content: string;
}

/** Result of evaluating a single quality gate. */
export interface GateResult {
  gate: string;
  pass: boolean;
  explanation: string;
}

/** Result of evaluating one requirement (all its gates). */
export interface EvaluationResult {
  requirementId: string;
  title: string;
  gates: GateResult[];
  pass: boolean;
}
