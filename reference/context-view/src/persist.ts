import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { RepoContext, ProjectInfo } from './scan.js';
import { extractSection } from './markdown.js';

const CONTEXT_FILE = 'CONTEXT.md';
const TIMELINE_START = '<!-- TIMELINE:START -->';
const TIMELINE_END = '<!-- TIMELINE:END -->';
const ENTRY_START = (key: string) => `<!-- ENTRY:${key}:START -->`;
const ENTRY_END = (key: string) => `<!-- ENTRY:${key}:END -->`;

/** Render a compact immutable project entry with reference to detail */
function renderProjectEntry(project: ProjectInfo): string {
  const lines: string[] = [];
  lines.push(`### ${project.key}`);
  lines.push('');

  if (project.evaluation) {
    // One-line summary from carry-forward or primitive
    const carry = extractSection(project.evaluation, 'Carry Forward');
    const primitive = extractSection(project.evaluation, 'The Primitive');
    const summary = carry || primitive;
    if (summary) {
      // Take first non-empty line as the compact summary
      const firstLine = summary.split('\n').find(l => l.trim());
      if (firstLine) lines.push(firstLine.trim());
    }
    lines.push('');
    lines.push(`See \`projects/${project.key}/EVALUATION.md\` for learnings and detail.`);
  }

  return lines.join('\n').trimEnd();
}

/** Render the introduction from CLAUDE.md */
function renderIntro(ctx: RepoContext): string {
  const lines: string[] = [];

  lines.push('## What Is This');
  lines.push('');

  if (ctx.claudeMd) {
    const whatThis = extractSection(ctx.claudeMd, 'What This Is');
    if (whatThis) {
      for (const line of whatThis.split('\n')) {
        if (line.trim()) lines.push(line.trim());
      }
    }

    const mission = extractSection(ctx.claudeMd, 'Mission');
    if (mission) {
      lines.push('');
      lines.push('**Mission:** ' + mission.split('\n').filter(l => l.trim()).join(' '));
    }
  } else {
    lines.push('Splectrum (spl3) — see CLAUDE.md for description.');
  }

  lines.push('');
  lines.push('## Vocabulary');
  lines.push('');
  lines.push('- **Entity** — Any participant: human, AI, process, sensor, capability');
  lines.push('- **Record** — Key → content (opaque bytes). The primitive');
  lines.push('- **Context** — Container of records. Records can be contexts. Recursive');
  lines.push('- **Mycelium** — Meaningless persistence layer. Stores, does not interpret');
  lines.push('- **Splectrum** — Expression layer. Meaning, references, quality gates');
  lines.push('- **HAICC** — Creation layer. Entity collaboration, autonomy, evaluation');
  lines.push('- **TDC** — Test-Driven Creation. Intent → requirements → build → verify');

  return lines.join('\n');
}

/** Render the mutable state section */
function renderState(ctx: RepoContext): string {
  const lines: string[] = [];

  lines.push('## Current State');
  lines.push('');

  // Conceptual state from latest completed project
  const completed = ctx.projects.filter(p => !p.latest);
  if (completed.length) {
    const last = completed[completed.length - 1];
    if (last.evaluation) {
      const carry = extractSection(last.evaluation, 'Carry Forward');
      if (carry) {
        lines.push('Where we are:');
        for (const line of carry.split('\n')) {
          if (line.trim()) lines.push(line.trim());
        }
        lines.push('');
      }
    }
  }

  // Current project — magnifying glass (expanded inline)
  const current = ctx.projects.find(p => p.latest);
  if (current) {
    lines.push(`Current project: **${current.key}**`);

    if (current.evaluation) {
      // Has evaluation — show what was built
      const built = extractSection(current.evaluation, 'What Was Built');
      if (built) {
        for (const line of built.split('\n')) {
          if (line.trim()) lines.push(line.trim());
        }
      }
    } else if (current.requirements) {
      // No evaluation yet — surface requirements inline
      const contentSection = extractSection(current.requirements, 'Content')
        || extractSection(current.requirements, 'Requirements');
      if (contentSection) {
        lines.push('');
        lines.push('Requirements:');
        for (const line of contentSection.split('\n')) {
          const trimmed = line.trim();
          if (trimmed) lines.push(trimmed);
        }
      } else {
        // Fall back to first paragraph after heading
        const reqLines = current.requirements.split('\n');
        let pastHeading = false;
        for (const line of reqLines) {
          if (line.startsWith('#')) { pastHeading = true; continue; }
          if (pastHeading && line.trim()) {
            lines.push(line.trim());
            break;
          }
        }
      }
    } else {
      lines.push('(in progress)');
    }

    lines.push('');
    lines.push(`See \`projects/${current.key}/\` for source and requirements.`);
    lines.push('');
  }

  // Documents
  lines.push('Documents:');
  for (const doc of ctx.rootDocs) {
    lines.push(`- ${doc.key} — ${doc.firstLine}`);
  }
  lines.push('');

  // Reading order
  lines.push('## Reading Order');
  lines.push('');
  lines.push('1. This file — orientation and current state');
  lines.push('2. PRINCIPLES.md — three-pillar conceptual model');
  lines.push('3. CLAUDE.md — working norms and build cycle');
  lines.push('4. EVALUATION.md files in projects/ — intellectual history');

  return lines.join('\n');
}

/** Parse existing CONTEXT.md to find which projects are already recorded */
function parseExistingEntries(content: string): Set<string> {
  const keys = new Set<string>();
  const pattern = /<!-- ENTRY:(.+?):START -->/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

/** Extract the immutable timeline section from existing file */
function extractTimeline(content: string): string {
  const startIdx = content.indexOf(TIMELINE_START);
  const endIdx = content.indexOf(TIMELINE_END);
  if (startIdx === -1 || endIdx === -1) return '';
  return content.slice(
    startIdx + TIMELINE_START.length,
    endIdx
  ).trimEnd();
}

/** Generate or update CONTEXT.md */
export function persist(ctx: RepoContext): { path: string; added: string[] } {
  const contextPath = join(ctx.root, CONTEXT_FILE);
  const completedProjects = ctx.projects.filter(p => !p.latest);
  const added: string[] = [];

  // Build the existing timeline or start fresh
  let timeline = '';
  let existingKeys = new Set<string>();

  if (existsSync(contextPath)) {
    const existing = readFileSync(contextPath, 'utf-8');
    existingKeys = parseExistingEntries(existing);
    timeline = extractTimeline(existing);
  }

  // Append new completed projects
  for (const project of completedProjects) {
    if (!existingKeys.has(project.key)) {
      const entry = [
        '',
        ENTRY_START(project.key),
        renderProjectEntry(project),
        ENTRY_END(project.key),
      ].join('\n');
      timeline += entry;
      added.push(project.key);
    }
  }

  // Assemble: intro + state + timeline
  const output = [
    '# Context',
    '',
    renderIntro(ctx),
    '',
    renderState(ctx),
    '',
    '## Timeline',
    '',
    TIMELINE_START,
    timeline,
    '',
    TIMELINE_END,
    '',
  ].join('\n');

  writeFileSync(contextPath, output);
  return { path: contextPath, added };
}
