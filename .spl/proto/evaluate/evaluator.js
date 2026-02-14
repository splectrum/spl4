/**
 * evaluate — quality gate evaluation protocol.
 *
 * Data-triggered pipeline: prepare → translate →
 * evaluate → report. Each step stateless, driven
 * by file presence in the transient context (.eval/).
 *
 * Two operations:
 *   run    — full pipeline for a project
 *   status — check pipeline state
 *
 * Async factories — imports mc modules via execDoc.root.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { parseRequirements } from './parser.js';

const EVAL_DIR = '.eval';
const SKIP_DIRS = new Set(['node_modules', '.git', '.eval', 'dist', '.spl', '.context-view']);

/**
 * run — async factory. Full evaluation pipeline.
 * Returns operator(projectPath).
 */
export async function run(execDoc) {
  const proto = p => pathToFileURL(join(execDoc.root, p)).href;
  const data = await import(proto('.spl/proto/mc.data/data.js'));
  const raw = await import(proto('.spl/proto/mc.raw/raw.js'));
  const core = await import(proto('.spl/proto/mc.core/core.js'));

  async function mcExists(path) {
    try {
      await raw.read(path, 'utf-8');
      return true;
    } catch { return false; }
  }

  function evalPath(projectPath, ...parts) {
    return projectPath + '/' + EVAL_DIR + (parts.length ? '/' + parts.join('/') : '');
  }

  /** Collect artifacts from a project directory */
  async function collectArtifacts(projectPath) {
    const artifacts = [];

    async function walk(dirPath) {
      const entries = await data.list(dirPath);
      for (const entry of entries) {
        const name = entry.path.split('/').pop();
        if (entry.type === 'directory') {
          if (!SKIP_DIRS.has(name)) await walk(entry.path);
        } else {
          try {
            const content = await raw.read(entry.path, 'utf-8');
            artifacts.push({ path: entry.path.slice(projectPath.length + 1), content });
          } catch { /* skip binary */ }
        }
      }
    }

    await walk(projectPath);
    return artifacts;
  }

  /** Ensure .eval/ directory exists, write file into it */
  async function ensureEvalDir(projectPath) {
    const evalDir = evalPath(projectPath);
    if (!await mcExists(evalDir + '/requirements.json')) {
      try {
        await core.create(projectPath, EVAL_DIR);
      } catch { /* already exists */ }
    }
  }

  async function writeEvalFile(projectPath, filename, content) {
    const dir = evalPath(projectPath);
    await core.create(dir, filename, Buffer.from(content));
  }

  /** Step 1: Prepare */
  async function prepare(projectPath) {
    const artifactsFile = evalPath(projectPath, 'artifacts.md');
    const reqsFile = evalPath(projectPath, 'requirements.json');

    if (await mcExists(artifactsFile) && await mcExists(reqsFile)) {
      return false;
    }

    await ensureEvalDir(projectPath);

    const reqContent = await raw.read(projectPath + '/REQUIREMENTS.md', 'utf-8');
    const requirements = parseRequirements(reqContent);
    await writeEvalFile(projectPath, 'requirements.json', JSON.stringify(requirements, null, 2));

    const artifacts = await collectArtifacts(projectPath);
    artifacts.push({ path: 'REQUIREMENTS.md', content: reqContent });

    const artifactsMd = artifacts
      .map(a => `--- ${a.path} ---\n${a.content}`)
      .join('\n\n');
    await writeEvalFile(projectPath, 'artifacts.md', artifactsMd);

    return true;
  }

  /** Step 2: Translate */
  async function translate(projectPath) {
    const reqsFile = evalPath(projectPath, 'requirements.json');
    const requirements = JSON.parse(await raw.read(reqsFile, 'utf-8'));
    const translated = [];

    for (const req of requirements) {
      const promptFile = evalPath(projectPath, `${req.id}.prompt.md`);
      if (await mcExists(promptFile)) continue;

      const gateList = req.gates.length > 0
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

      await writeEvalFile(projectPath, `${req.id}.prompt.md`, prompt);
      translated.push(req.id);
    }

    return translated;
  }

  /** Step 3: Evaluate — execute prompts via claude CLI */
  async function evaluate(projectPath) {
    const reqsFile = evalPath(projectPath, 'requirements.json');
    const requirements = JSON.parse(await raw.read(reqsFile, 'utf-8'));
    const artifacts = await raw.read(evalPath(projectPath, 'artifacts.md'), 'utf-8');
    const completed = [];

    for (const req of requirements) {
      const resultFile = evalPath(projectPath, `${req.id}.result.json`);
      if (await mcExists(resultFile)) continue;

      const prompt = await raw.read(evalPath(projectPath, `${req.id}.prompt.md`), 'utf-8');
      const combined = `${prompt}\n\nARTIFACTS:\n${artifacts}`;

      const gates = callClaude(combined);
      await writeEvalFile(projectPath, `${req.id}.result.json`, JSON.stringify(gates, null, 2));
      completed.push(req.id);
    }

    return completed;
  }

  /** Step 4: Report */
  async function buildReport(projectPath) {
    const reqsFile = evalPath(projectPath, 'requirements.json');
    const requirements = JSON.parse(await raw.read(reqsFile, 'utf-8'));
    const results = [];

    for (const req of requirements) {
      const resultFile = evalPath(projectPath, `${req.id}.result.json`);
      if (!await mcExists(resultFile)) return null;

      const gates = JSON.parse(await raw.read(resultFile, 'utf-8'));
      results.push({
        requirementId: req.id,
        title: req.title,
        gates,
        pass: gates.every(g => g.pass),
      });
    }

    const allPass = results.every(r => r.pass);
    const lines = [];
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
    await writeEvalFile(projectPath, 'report.md', content);
    return { content, results, allPass };
  }

  /** Invoke claude CLI */
  function callClaude(prompt) {
    try {
      const env = { ...process.env };
      delete env.CLAUDECODE;
      const result = execSync(
        'claude --print --model haiku',
        { input: prompt, encoding: 'utf-8', maxBuffer: 1024 * 1024, env }
      );
      return parseResponse(result.trim());
    } catch (e) {
      return [{ gate: 'evaluation', pass: false, explanation: `CLI error: ${e.message}` }];
    }
  }

  /** Parse claude response into gate results */
  function parseResponse(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return [{ gate: 'evaluation', pass: false, explanation: 'No JSON in response' }];
      }
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.gates || !Array.isArray(parsed.gates)) {
        return [{ gate: 'evaluation', pass: false, explanation: 'Response missing gates array' }];
      }
      return parsed.gates.map(g => ({
        gate: String(g.gate || ''),
        pass: Boolean(g.pass),
        explanation: String(g.explanation || ''),
      }));
    } catch {
      return [{ gate: 'evaluation', pass: false, explanation: 'Failed to parse response' }];
    }
  }

  // The operator — projectPath is relative to CWD
  return async function (projectPath) {
    const target = execDoc.resolvePath(projectPath);

    await prepare(target);
    await translate(target);
    await evaluate(target);
    const result = await buildReport(target);

    if (!result) {
      return { project: projectPath, error: 'Could not assemble report' };
    }

    return {
      project: projectPath,
      pass: result.allPass,
      results: result.results,
      report: result.content,
    };
  };
}

/**
 * status — async factory. Check pipeline state.
 * Returns operator(projectPath).
 */
export async function status(execDoc) {
  const proto = p => pathToFileURL(join(execDoc.root, p)).href;
  const raw = await import(proto('.spl/proto/mc.raw/raw.js'));

  async function mcExists(path) {
    try {
      await raw.read(path, 'utf-8');
      return true;
    } catch { return false; }
  }

  function evalPath(projectPath, ...parts) {
    return projectPath + '/' + EVAL_DIR + (parts.length ? '/' + parts.join('/') : '');
  }

  return async function (projectPath) {
    const target = execDoc.resolvePath(projectPath);

    const artifactsExists = await mcExists(evalPath(target, 'artifacts.md'));
    const reqsExists = await mcExists(evalPath(target, 'requirements.json'));

    if (!artifactsExists || !reqsExists) {
      return { project: projectPath, phase: 'prepare', detail: 'No artifacts or requirements' };
    }

    const requirements = JSON.parse(await raw.read(evalPath(target, 'requirements.json'), 'utf-8'));
    const needPrompt = [];
    const needResult = [];

    for (const req of requirements) {
      if (!await mcExists(evalPath(target, `${req.id}.prompt.md`))) {
        needPrompt.push(req.id);
      } else if (!await mcExists(evalPath(target, `${req.id}.result.json`))) {
        needResult.push(req.id);
      }
    }

    if (needPrompt.length > 0) {
      return { project: projectPath, phase: 'translate', detail: `Need prompts: ${needPrompt.join(', ')}` };
    }

    if (needResult.length > 0) {
      return { project: projectPath, phase: 'evaluate', detail: `Need results: ${needResult.join(', ')}` };
    }

    if (!await mcExists(evalPath(target, 'report.md'))) {
      return { project: projectPath, phase: 'report', detail: 'All results ready, need report' };
    }

    return { project: projectPath, phase: 'done', detail: 'Complete' };
  };
}

/** Format run result as human-readable text */
export function formatRun(result) {
  if (result.error) return `Error: ${result.error}`;
  return result.report;
}

/** Format status result */
export function formatStatus(result) {
  return `${result.project}: ${result.phase} — ${result.detail}`;
}
