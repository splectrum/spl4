/**
 * context-view/sync — full pipeline.
 *
 * Scan -> haiccer -> persist CONTEXT.md.
 */

import { doScan, buildPrompt, writePrompt, invokeHaiccer, persistContext } from './lib.js';

export default async function (execDoc) {
  const dataList = await execDoc.resolve('mc.data/list');
  const rawRead = await execDoc.resolve('mc.raw/read');

  return async function () {
    const result = await doScan(dataList, rawRead, execDoc.root);
    const prompt = buildPrompt(result);
    const promptPath = writePrompt(execDoc.root, prompt);
    const content = invokeHaiccer(promptPath);
    const contextPath = persistContext(execDoc.root, content);
    return { updated: contextPath, projects: result.projects.length };
  };
}
