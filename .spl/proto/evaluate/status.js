/**
 * evaluate/status — check evaluation pipeline state.
 */

import { evalPath, mcExists } from './lib.js';

export default async function (execDoc) {
  const rawRead = await execDoc.resolve('mc.raw/read');

  async function exists(path) {
    return mcExists(rawRead, path);
  }

  return async function (projectPath) {
    const target = execDoc.resolvePath(projectPath);

    const artifactsExists = await exists(evalPath(target, 'artifacts.md'));
    const reqsExists = await exists(evalPath(target, 'requirements.json'));

    if (!artifactsExists || !reqsExists) {
      return { project: projectPath, phase: 'prepare', detail: 'No artifacts or requirements' };
    }

    const requirements = JSON.parse(await rawRead(evalPath(target, 'requirements.json'), 'utf-8'));
    const needPrompt = [];
    const needResult = [];

    for (const req of requirements) {
      if (!await exists(evalPath(target, `${req.id}.prompt.md`))) {
        needPrompt.push(req.id);
      } else if (!await exists(evalPath(target, `${req.id}.result.json`))) {
        needResult.push(req.id);
      }
    }

    if (needPrompt.length > 0) {
      return { project: projectPath, phase: 'translate', detail: `Need prompts: ${needPrompt.join(', ')}` };
    }

    if (needResult.length > 0) {
      return { project: projectPath, phase: 'evaluate', detail: `Need results: ${needResult.join(', ')}` };
    }

    if (!await exists(evalPath(target, 'report.md'))) {
      return { project: projectPath, phase: 'report', detail: 'All results ready, need report' };
    }

    return { project: projectPath, phase: 'done', detail: 'Complete' };
  };
}
