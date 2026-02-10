/**
 * Data-triggered pipeline.
 *
 * Each step reads inputs from the transient context,
 * writes outputs. Presence/absence of files determines
 * what needs to happen. Stateless — kill and restart
 * at any point.
 *
 * Transient context: .eval/ inside the project directory.
 *
 * Files:
 *   artifacts.md       — all source files, loaded once
 *   requirements.json  — parsed requirements
 *   R{n}.prompt.md     — per-requirement prompt (lightweight)
 *   R{n}.result.json   — per-requirement evaluation result
 *   report.md          — assembled final report
 */

import { readFile, writeFile, readdir, stat, mkdir } from 'fs/promises';
import { join, relative } from 'path';
import { Requirement, Artifact, GateResult, EvaluationResult } from './types.js';
import { parseRequirements } from './parser.js';

const EVAL_DIR = '.eval';

function evalPath(projectPath: string, ...parts: string[]): string {
  return join(projectPath, EVAL_DIR, ...parts);
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function collectArtifacts(
  dir: string,
  base: string
): Promise<Artifact[]> {
  const artifacts: Artifact[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', EVAL_DIR, 'dist'].includes(entry.name)) continue;
        artifacts.push(...(await collectArtifacts(fullPath, base)));
      } else if (entry.isFile()) {
        const content = await readFile(fullPath, 'utf-8');
        artifacts.push({ path: relative(base, fullPath), content });
      }
    }
  } catch {
    // directory doesn't exist
  }
  return artifacts;
}

/**
 * Step 1: Prepare — load artifacts and parse requirements.
 * Writes artifacts.md and requirements.json.
 */
export async function prepare(projectPath: string): Promise<boolean> {
  const dir = evalPath(projectPath);
  const artifactsFile = evalPath(projectPath, 'artifacts.md');
  const reqsFile = evalPath(projectPath, 'requirements.json');

  if (await exists(artifactsFile) && await exists(reqsFile)) {
    return false; // already done
  }

  await mkdir(dir, { recursive: true });

  const reqContent = await readFile(join(projectPath, 'REQUIREMENTS.md'), 'utf-8');
  const requirements = parseRequirements(reqContent);
  await writeFile(reqsFile, JSON.stringify(requirements, null, 2));

  const artifacts = await collectArtifacts(join(projectPath, 'src'), projectPath);
  artifacts.push({ path: 'REQUIREMENTS.md', content: reqContent });

  const artifactsMd = artifacts
    .map((a) => `--- ${a.path} ---\n${a.content}`)
    .join('\n\n');
  await writeFile(artifactsFile, artifactsMd);

  return true;
}

/**
 * Step 2: Translate — produce per-requirement prompts.
 * Each prompt is lightweight (requirement + gates + instructions).
 * Artifacts are a separate file, combined at execution time.
 */
export async function translate(projectPath: string): Promise<string[]> {
  const reqsFile = evalPath(projectPath, 'requirements.json');
  const requirements: Requirement[] = JSON.parse(await readFile(reqsFile, 'utf-8'));

  const translated: string[] = [];

  for (const req of requirements) {
    const promptFile = evalPath(projectPath, `${req.id}.prompt.md`);
    if (await exists(promptFile)) continue;

    const gateList =
      req.gates.length > 0
        ? req.gates.map((g, i) => `${i + 1}. ${g}`).join('\n')
        : `1. ${req.title} is satisfied`;

    const prompt = `Evaluate whether the artifacts satisfy this requirement.

REQUIREMENT ${req.id}: ${req.title}
${req.text}

QUALITY GATES:
${gateList}

For each quality gate, determine PASS or FAIL based on the artifacts.
Provide a brief explanation for each.

Respond in this exact JSON format:
{
  "gates": [
    {
      "gate": "the gate text",
      "pass": true,
      "explanation": "why it passes or fails"
    }
  ]
}`;

    await writeFile(promptFile, prompt);
    translated.push(req.id);
  }

  return translated;
}

/**
 * Step 3: Evaluate — execute prompts via a capability.
 * This step is in execute.ts (capability binding).
 * Returns which requirements still need evaluation.
 */
export async function pending(projectPath: string): Promise<string[]> {
  const reqsFile = evalPath(projectPath, 'requirements.json');
  const requirements: Requirement[] = JSON.parse(await readFile(reqsFile, 'utf-8'));

  const need: string[] = [];
  for (const req of requirements) {
    if (!(await exists(evalPath(projectPath, `${req.id}.result.json`)))) {
      need.push(req.id);
    }
  }
  return need;
}

/**
 * Read a prompt file for a given requirement.
 */
export async function readPrompt(projectPath: string, reqId: string): Promise<string> {
  return readFile(evalPath(projectPath, `${reqId}.prompt.md`), 'utf-8');
}

/**
 * Read the shared artifacts file.
 */
export async function readArtifacts(projectPath: string): Promise<string> {
  return readFile(evalPath(projectPath, 'artifacts.md'), 'utf-8');
}

/**
 * Write evaluation result for a requirement.
 */
export async function writeResult(
  projectPath: string,
  reqId: string,
  gates: GateResult[]
): Promise<void> {
  await writeFile(
    evalPath(projectPath, `${reqId}.result.json`),
    JSON.stringify(gates, null, 2)
  );
}

/**
 * Step 4: Report — assemble results into report.md.
 * Returns null if not all results are ready.
 */
export async function report(projectPath: string): Promise<string | null> {
  const reqsFile = evalPath(projectPath, 'requirements.json');
  const requirements: Requirement[] = JSON.parse(await readFile(reqsFile, 'utf-8'));

  const results: EvaluationResult[] = [];
  for (const req of requirements) {
    const resultFile = evalPath(projectPath, `${req.id}.result.json`);
    if (!(await exists(resultFile))) return null;

    const gates: GateResult[] = JSON.parse(await readFile(resultFile, 'utf-8'));
    results.push({
      requirementId: req.id,
      title: req.title,
      gates,
      pass: gates.every((g) => g.pass),
    });
  }

  const allPass = results.every((r) => r.pass);
  const lines: string[] = [];
  lines.push('# Evaluation Report');
  lines.push('');
  lines.push(`Overall: ${allPass ? 'PASS' : 'FAIL'}`);
  lines.push('');

  for (const result of results) {
    const icon = result.pass ? 'PASS' : 'FAIL';
    lines.push(`## ${result.requirementId}: ${result.title} — ${icon}`);
    lines.push('');
    for (const gate of result.gates) {
      const gateIcon = gate.pass ? '[x]' : '[ ]';
      lines.push(`- ${gateIcon} ${gate.gate}`);
      if (gate.explanation) {
        lines.push(`  ${gate.explanation}`);
      }
    }
    lines.push('');
  }

  const content = lines.join('\n');
  await writeFile(evalPath(projectPath, 'report.md'), content);
  return content;
}

/**
 * Status — check data state, report current phase.
 */
export async function status(projectPath: string): Promise<{
  phase: 'prepare' | 'translate' | 'evaluate' | 'report' | 'done';
  detail: string;
}> {
  const dir = evalPath(projectPath);
  if (!(await exists(dir))) {
    return { phase: 'prepare', detail: 'No .eval/ directory' };
  }

  if (
    !(await exists(evalPath(projectPath, 'artifacts.md'))) ||
    !(await exists(evalPath(projectPath, 'requirements.json')))
  ) {
    return { phase: 'prepare', detail: 'Missing artifacts or requirements' };
  }

  const reqs: Requirement[] = JSON.parse(
    await readFile(evalPath(projectPath, 'requirements.json'), 'utf-8')
  );

  const needPrompt: string[] = [];
  const needResult: string[] = [];
  for (const req of reqs) {
    if (!(await exists(evalPath(projectPath, `${req.id}.prompt.md`)))) {
      needPrompt.push(req.id);
    } else if (!(await exists(evalPath(projectPath, `${req.id}.result.json`)))) {
      needResult.push(req.id);
    }
  }

  if (needPrompt.length > 0) {
    return { phase: 'translate', detail: `Need prompts: ${needPrompt.join(', ')}` };
  }

  if (needResult.length > 0) {
    return { phase: 'evaluate', detail: `Need results: ${needResult.join(', ')}` };
  }

  if (!(await exists(evalPath(projectPath, 'report.md')))) {
    return { phase: 'report', detail: 'All results ready, need report' };
  }

  return { phase: 'done', detail: 'Complete' };
}
