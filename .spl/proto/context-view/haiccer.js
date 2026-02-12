import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { formatScan } from './scan.js';

const PROMPT_TEMPLATE = `Generate a context description from the scan data below.

Output ONLY the raw markdown content. No code fences, no
commentary, no explanation. Just the document.

Structure:

# Context

## Current: <project title>

A brief summary (2-4 lines) of what the current project
is doing and where it stands. Headline + summary style.

See projects/<key>/

## Completed

For each completed project (most recent first):
<project title> — one line summary of outcome
  See projects/<key>/EVALUATION.md

Rules:
- Output raw markdown only — no wrapping, no commentary
- Be concise and neutral — report, don't interpret
- Use the project's own language, don't invent
- Current project gets the magnifying glass (more detail)
- Completed projects get headline + reference only
- No vocabulary sections, no reading order, no intro
`;

/** Produce the haiccer prompt */
export function buildPrompt(result) {
  const scan = formatScan(result);
  return `${PROMPT_TEMPLATE}\n---\n\n${scan}`;
}

/** Write prompt to .context-view/ transient directory */
export function writePrompt(prompt) {
  const root = process.env.SPL_ROOT;
  const evalDir = join(root, '.context-view');
  if (!existsSync(evalDir))
    mkdirSync(evalDir, { recursive: true });
  const promptPath = join(evalDir, 'prompt.md');
  writeFileSync(promptPath, prompt);
  return promptPath;
}

/** Invoke the haiccer (claude CLI) and return the result */
export function invoke(promptPath) {
  const result = execSync(
    `cat "${promptPath}" | claude --print --model haiku`,
    { encoding: 'utf-8', maxBuffer: 1024 * 1024 }
  );
  return result.trim();
}
