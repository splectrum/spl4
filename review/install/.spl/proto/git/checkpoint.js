/**
 * git/checkpoint — stage, commit, push in one operation.
 *
 * Usage: spl git checkpoint <path> <intent>
 *
 * Stages all repo changes, gathers status + diff, uses
 * Claude to write a commit message from intent and actual
 * changes, commits, pushes. Path scopes intent, not staging.
 *
 * A checkpoint is a rollback point.
 */

import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { git, gitSafe } from './lib.js';

const COAUTHOR = 'Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>';

export default async function (execDoc) {
  const root = execDoc.root;

  return function (path, intent) {
    if (!path) throw new Error('path required');
    if (!intent) throw new Error('intent required');

    // Resolve to filesystem path relative to repo root
    const mcPath = execDoc.resolvePath(path);
    const fsPath = mcPath === '/' ? '.' : mcPath.slice(1);

    // Stage everything — checkpoint captures all repo changes
    git(root, 'add', '.');

    // Gather context for the commit message
    const status = git(root, 'status', '--short');
    const diff = gitSafe(root, 'diff', '--cached', '--stat') || '';
    const diffDetail = gitSafe(root, 'diff', '--cached', '--no-color') || '';

    // Truncate diff detail if too large for the prompt
    const maxDiff = 8000;
    const trimmedDiff = diffDetail.length > maxDiff
      ? diffDetail.slice(0, maxDiff) + '\n... (truncated)'
      : diffDetail;

    // Ask Claude to write the commit message
    const prompt = `Write a git commit message. The caller provides the intent (the "why"), you add the detail (the "what") from the diff.

INTENT: ${intent}

FILES CHANGED:
${status}

DIFF SUMMARY:
${diff}

DIFF DETAIL:
${trimmedDiff}

Format:
- Line 1: the intent as summary (keep it, max 72 chars)
- Line 2: blank
- Lines 3+: short body (3-6 lines max) noting key changes from the diff
- Be specific: name files, functions, patterns — not generic descriptions
- No Co-Authored-By, no preamble, no code fences, no commentary
- Start directly with the summary line`;

    const commitMsg = callClaude(prompt);

    // Assemble final message with co-author
    const fullMessage = `${commitMsg}\n\n${COAUTHOR}`;

    const msgFile = join(root, '.git', 'CHECKPOINT_MSG');
    writeFileSync(msgFile, fullMessage);

    try {
      git(root, 'commit', '-F', msgFile);
      git(root, 'push');
    } finally {
      try { unlinkSync(msgFile); } catch { /* ok */ }
    }

    const hash = git(root, 'rev-parse', '--short', 'HEAD');
    const fullHash = git(root, 'rev-parse', 'HEAD');

    return {
      checkpoint: hash,
      hash: fullHash,
      path: fsPath,
      message: commitMsg,
    };
  };
}

function callClaude(prompt) {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  try {
    let result = execSync(
      'claude --print --model haiku',
      { input: prompt, encoding: 'utf-8', maxBuffer: 1024 * 1024, env }
    ).trim();

    // Strip code fences if Claude wrapped the response
    result = result.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '');

    // Strip preamble before the actual commit message
    // (e.g. "Here's the commit message:" or similar)
    const lines = result.split('\n');
    const firstMeaningful = lines.findIndex(l =>
      l && !l.match(/^(here|looking|based|the commit|this is|sure|okay|ok\b)/i)
    );
    if (firstMeaningful > 0) {
      result = lines.slice(firstMeaningful).join('\n');
    }

    return result.trim();
  } catch {
    return 'checkpoint';
  }
}
