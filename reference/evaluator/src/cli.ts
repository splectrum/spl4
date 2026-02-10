#!/usr/bin/env node

/**
 * Evaluator CLI — data-triggered pipeline.
 *
 * Each command checks data state and does what's needed.
 * Delete a file to re-run its step.
 *
 *   evaluate <project-path>          — run full pipeline
 *   evaluate status <project-path>   — show current phase
 *   evaluate prepare <project-path>  — load artifacts + parse reqs
 *   evaluate translate <project-path> — generate prompts
 *   evaluate run <project-path>      — execute via claude CLI
 *   evaluate report <project-path>   — assemble report
 */

import { resolve } from 'path';
import { status, prepare, translate, report } from './pipeline.js';
import { executePending } from './execute.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help') {
    console.log('Usage: evaluate <command> <project-path>');
    console.log('');
    console.log('Commands:');
    console.log('  <project-path>           Run full pipeline');
    console.log('  status <project-path>    Show current phase');
    console.log('  prepare <project-path>   Load artifacts, parse requirements');
    console.log('  translate <project-path> Generate per-requirement prompts');
    console.log('  run <project-path>       Execute pending via claude CLI');
    console.log('  report <project-path>    Assemble report from results');
    console.log('');
    console.log('Data-triggered: each step skips if already done.');
    console.log('Delete a file in .eval/ to re-run its step.');
    process.exit(0);
  }

  // Resolve command and path
  let cmd: string;
  let projectPath: string;

  if (['status', 'prepare', 'translate', 'run', 'report'].includes(command)) {
    cmd = command;
    projectPath = resolve(args[1] || '.');
  } else {
    cmd = 'full';
    projectPath = resolve(command);
  }

  if (cmd === 'status') {
    const s = await status(projectPath);
    console.log(`Phase: ${s.phase}`);
    console.log(s.detail);
    return;
  }

  if (cmd === 'prepare' || cmd === 'full') {
    const did = await prepare(projectPath);
    console.log(did ? 'Prepared: artifacts.md + requirements.json' : 'Prepare: already done');
    if (cmd === 'prepare') return;
  }

  if (cmd === 'translate' || cmd === 'full') {
    const ids = await translate(projectPath);
    console.log(
      ids.length > 0
        ? `Translated: ${ids.join(', ')}`
        : 'Translate: all prompts exist'
    );
    if (cmd === 'translate') return;
  }

  if (cmd === 'run' || cmd === 'full') {
    const completed = await executePending(projectPath, (id, phase) => {
      if (phase === 'start') process.stderr.write(`Evaluating ${id}...`);
      if (phase === 'done') process.stderr.write(` done\n`);
    });
    console.log(
      completed.length > 0
        ? `Evaluated: ${completed.join(', ')}`
        : 'Evaluate: all results exist'
    );
    if (cmd === 'run') return;
  }

  if (cmd === 'report' || cmd === 'full') {
    const content = await report(projectPath);
    if (content) {
      console.log(content);
    } else {
      console.log('Report: not all results ready');
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
