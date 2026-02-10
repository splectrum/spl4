/**
 * Execute — capability binding for evaluation step.
 *
 * Reads prompt + artifacts from the transient context,
 * sends to claude CLI, writes result. Each requirement
 * is independent — stateless, restartable.
 */

import { execFile } from 'child_process';
import { GateResult } from './types.js';
import { pending, readPrompt, readArtifacts, writeResult } from './pipeline.js';

/**
 * Execute pending evaluations via claude CLI.
 * Consecutive — one at a time, result saved after each.
 */
export async function executePending(
  projectPath: string,
  onProgress?: (reqId: string, phase: 'start' | 'done') => void
): Promise<string[]> {
  const need = await pending(projectPath);
  if (need.length === 0) return [];

  const artifacts = await readArtifacts(projectPath);
  const completed: string[] = [];

  for (const reqId of need) {
    onProgress?.(reqId, 'start');

    const prompt = await readPrompt(projectPath, reqId);
    const combined = `${prompt}\n\nARTIFACTS:\n${artifacts}`;

    const gates = await callClaude(combined);
    await writeResult(projectPath, reqId, gates);

    onProgress?.(reqId, 'done');
    completed.push(reqId);
  }

  return completed;
}

function callClaude(prompt: string): Promise<GateResult[]> {
  return new Promise((resolve) => {
    execFile(
      'claude',
      ['-p', prompt],
      { maxBuffer: 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          resolve([{ gate: 'evaluation', pass: false, explanation: `CLI error: ${error.message}` }]);
          return;
        }
        resolve(parseResponse(stdout));
      }
    );
  });
}

function parseResponse(text: string): GateResult[] {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [{ gate: 'evaluation', pass: false, explanation: 'No JSON in response' }];
    }
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.gates || !Array.isArray(parsed.gates)) {
      return [{ gate: 'evaluation', pass: false, explanation: 'Response missing gates array' }];
    }
    return parsed.gates.map((g: any) => ({
      gate: String(g.gate || ''),
      pass: Boolean(g.pass),
      explanation: String(g.explanation || ''),
    }));
  } catch {
    return [{ gate: 'evaluation', pass: false, explanation: 'Failed to parse response' }];
  }
}
