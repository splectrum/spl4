/**
 * git/checkpoint — stage, commit, push in one operation.
 *
 * Usage: spl git checkpoint <path> <intent>
 *
 * Stages all changes under path, gathers status + diff,
 * uses Claude to write a proper commit message from the
 * intent and actual changes, commits, pushes.
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

    // Stage first so diff --cached shows what will be committed
    git(root, 'add', fsPath);

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
    const prompt = `Write a git commit message for these changes.

INTENT: ${intent}

FILES CHANGED:
${status}

DIFF SUMMARY:
${diff}

DIFF DETAIL:
${trimmedDiff}

Rules:
- First line: concise summary (max 72 chars), imperative mood
- Blank line, then body paragraphs explaining what and why
- Be specific about what changed, not generic
- Reference specific files/functions when meaningful
- Do NOT include Co-Authored-By (added automatically)
- Output ONLY the commit message, nothing else`;

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
    return execSync(
      'claude --print --model haiku',
      { input: prompt, encoding: 'utf-8', maxBuffer: 1024 * 1024, env }
    ).trim();
  } catch {
    return 'checkpoint';
  }
}
