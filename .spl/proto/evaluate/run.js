/**
 * evaluate/run — full evaluation pipeline.
 *
 * Data-triggered: prepare -> translate -> evaluate -> report.
 * Each step stateless, driven by file presence in .eval/.
 */

import { execSync } from 'node:child_process';
import { parseRequirements } from './parser.js';
import { EVAL_DIR, SKIP_DIRS, evalPath, mcExists } from './lib.js';

export default async function (execDoc) {
  const dataList = await execDoc.resolve('mc.data/list');
  const rawRead = await execDoc.resolve('mc.raw/read');
  const coreCreate = await execDoc.resolve('mc.core/create');

  async function exists(path) {
    return mcExists(rawRead, path);
  }

  /** Collect artifacts from a project directory */
  async function collectArtifacts(projectPath) {
    const artifacts = [];

    async function walk(dirPath) {
      const entries = await dataList(dirPath);
      for (const entry of entries) {
        const name = entry.path.split('/').pop();
        if (entry.type === 'directory') {
          if (!SKIP_DIRS.has(name)) await walk(entry.path);
        } else {
          try {
            const content = await rawRead(entry.path, 'utf-8');
            artifacts.push({ path: entry.path.slice(projectPath.length + 1), content });
          } catch { /* skip binary */ }
        }
      }
    }

    await walk(projectPath);
    return artifacts;
  }

  /** Ensure .eval/ directory exists */
  async function ensureEvalDir(projectPath) {
    const dir = evalPath(projectPath);
    if (!await exists(dir + '/requirements.json')) {
      try {
        await coreCreate(projectPath, EVAL_DIR);
      } catch { /* already exists */ }
    }
  }

  async function writeEvalFile(projectPath, filename, content) {
    const dir = evalPath(projectPath);
    await coreCreate(dir, filename, Buffer.from(content));
  }

  /** Step 1: Prepare */
  async function prepare(projectPath) {
    const artifactsFile = evalPath(projectPath, 'artifacts.md');
    const reqsFile = evalPath(projectPath, 'requirements.json');

    if (await exists(artifactsFile) && await exists(reqsFile)) {
      return false;
    }

    await ensureEvalDir(projectPath);

    const reqContent = await rawRead(projectPath + '/REQUIREMENTS.md', 'utf-8');
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
    const requirements = JSON.parse(await rawRead(reqsFile, 'utf-8'));
    const translated = [];

    for (const req of requirements) {
      const promptFile = evalPath(projectPath, `${req.id}.prompt.md`);
      if (await exists(promptFile)) continue;

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
    const requirements = JSON.parse(await rawRead(reqsFile, 'utf-8'));
    const artifacts = await rawRead(evalPath(projectPath, 'artifacts.md'), 'utf-8');
    const completed = [];

    for (const req of requirements) {
      const resultFile = evalPath(projectPath, `${req.id}.result.json`);
      if (await exists(resultFile)) continue;

      const prompt = await rawRead(evalPath(projectPath, `${req.id}.prompt.md`), 'utf-8');
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
    const requirements = JSON.parse(await rawRead(reqsFile, 'utf-8'));
    const results = [];

    for (const req of requirements) {
      const resultFile = evalPath(projectPath, `${req.id}.result.json`);
      if (!await exists(resultFile)) return null;

      const gates = JSON.parse(await rawRead(resultFile, 'utf-8'));
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

  /** Invoke claude CLI with retry on parse failure */
  function callClaude(prompt) {
    const result = tryCallClaude(prompt);
    if (result) return result;
    // Retry once on parse failure
    console.log('Retrying claude call after parse failure...');
    const retry = tryCallClaude(prompt);
    if (retry) return retry;
    return [{ gate: 'evaluation', pass: false, explanation: 'Failed to parse response after retry' }];
  }

  function tryCallClaude(prompt) {
    try {
      const env = { ...process.env };
      delete env.CLAUDECODE;
      const result = execSync(
        'claude --print --model haiku',
        { input: prompt, encoding: 'utf-8', maxBuffer: 1024 * 1024, env }
      );
      return parseResponse(result.trim());
    } catch (e) {
      return null;
    }
  }

  /** Parse claude response into gate results */
  function parseResponse(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.gates || !Array.isArray(parsed.gates)) return null;
      return parsed.gates.map(g => ({
        gate: String(g.gate || ''),
        pass: Boolean(g.pass),
        explanation: String(g.explanation || ''),
      }));
    } catch {
      return null;
    }
  }

  /** Process compliance — check artifacts against process requirements */
  async function checkCompliance(projectPath) {
    const complianceFile = evalPath(projectPath, 'compliance-report.md');
    if (await exists(complianceFile)) {
      return { content: await rawRead(complianceFile, 'utf-8'), cached: true };
    }

    // Discover process requirements through references
    let processEntries;
    try {
      processEntries = await dataList(projectPath + '/process');
    } catch {
      return null; // No process/ in scope — skip compliance
    }

    const reqFiles = processEntries
      .filter(e => e.type === 'file' && e.path.split('/').pop().startsWith('req-'));

    if (reqFiles.length === 0) return null;

    // Determine which req files apply
    const hasRequirements = await exists(projectPath + '/REQUIREMENTS.md');
    const hasEvaluation = await exists(projectPath + '/EVALUATION.md');
    let hasQualityGates = false;
    if (hasRequirements) {
      const reqContent = await rawRead(projectPath + '/REQUIREMENTS.md', 'utf-8');
      hasQualityGates = /^## Quality Gates/m.test(reqContent);
    }

    const applicable = reqFiles.filter(e => {
      const name = e.path.split('/').pop();
      if (name === 'req-project.md' || name === 'req-build-cycle.md') return true;
      if (name === 'req-requirements.md') return hasRequirements;
      if (name === 'req-evaluation.md') return hasEvaluation;
      if (name === 'req-quality-gates.md') return hasQualityGates;
      return false;
    });

    if (applicable.length === 0) return null;

    // Collect artifacts (reuse if already in .eval/)
    let artifactsMd;
    try {
      artifactsMd = await rawRead(evalPath(projectPath, 'artifacts.md'), 'utf-8');
    } catch {
      const artifacts = await collectArtifacts(projectPath);
      artifactsMd = artifacts.map(a => `--- ${a.path} ---\n${a.content}`).join('\n\n');
    }

    await ensureEvalDir(projectPath);

    // Evaluate each applicable process requirement
    const results = [];
    for (const entry of applicable) {
      const reqName = entry.path.split('/').pop().replace('.md', '');
      const reqContent = await rawRead(entry.path, 'utf-8');
      const requirements = parseRequirements(reqContent);

      const prompt = `Check whether these project artifacts comply with this process requirement.

PROCESS REQUIREMENT: ${reqName}
${reqContent}

For each requirement (R1, R2, etc.), determine PASS or FAIL based on the artifacts.

Respond in this exact JSON format:
{
  "gates": [
    {
      "gate": "R1: requirement title",
      "pass": true,
      "explanation": "why it passes or fails"
    }
  ]
}`;

      const combined = `${prompt}\n\nARTIFACTS:\n${artifactsMd}`;
      const gates = callClaude(combined);

      results.push({
        source: reqName,
        requirements: requirements.length,
        gates,
        pass: gates.every(g => g.pass),
      });
    }

    // Build compliance report
    const allPass = results.every(r => r.pass);
    const lines = ['# Process Compliance Report', ''];
    lines.push(`Overall: ${allPass ? 'PASS' : 'FAIL'}`);
    lines.push('');

    for (const result of results) {
      const icon = result.pass ? 'PASS' : 'FAIL';
      lines.push(`## ${result.source} — ${icon}`);
      lines.push('');
      for (const gate of result.gates) {
        const gateIcon = gate.pass ? '[x]' : '[ ]';
        lines.push(`- ${gateIcon} ${gate.gate}`);
        if (gate.explanation) lines.push(`  ${gate.explanation}`);
      }
      lines.push('');
    }

    const content = lines.join('\n');
    await writeEvalFile(projectPath, 'compliance-report.md', content);
    return { content, results, allPass };
  }

  // The operator
  return async function (projectPath) {
    const target = execDoc.resolvePath(projectPath);

    await prepare(target);
    await translate(target);
    await evaluate(target);
    const result = await buildReport(target);

    // Process compliance (separate report)
    const compliance = await checkCompliance(target);

    if (!result) {
      return { project: projectPath, error: 'Could not assemble report' };
    }

    const output = {
      project: projectPath,
      pass: result.allPass,
      results: result.results,
      report: result.content,
    };

    if (compliance && !compliance.cached) {
      output.compliance = {
        pass: compliance.allPass,
        results: compliance.results,
        report: compliance.content,
      };
    }

    return output;
  };
}
