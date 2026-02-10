import { RepoContext } from './scan.js';
import { extractSection } from './markdown.js';

/** Render a concise context summary */
export function render(ctx: RepoContext): string {
  const lines: string[] = [];

  lines.push('# Repo Context');
  lines.push('');

  // Root docs
  lines.push('## Documents');
  for (const doc of ctx.rootDocs) {
    lines.push(`  ${doc.key} — ${doc.firstLine}`);
  }
  lines.push('');

  // Projects timeline
  lines.push('## Projects');
  if (!ctx.projects.length) {
    lines.push('  (none)');
  }

  for (const project of ctx.projects) {
    lines.push(`### ${project.key}`);

    // Source files
    const sourceFiles = project.files.filter(f =>
      !f.startsWith('.') || f === '.gitignore'
    );
    lines.push(`  Files: ${sourceFiles.join(', ')}`);

    if (project.evaluation) {
      // Extract key learnings
      const learned = extractSection(project.evaluation, 'What We Learned')
        || extractSection(project.evaluation, 'What We Confirmed');
      if (learned) {
        lines.push('  Learnings:');
        // Pull out ### headings as summary points
        for (const line of learned.split('\n')) {
          if (line.startsWith('### ')) {
            lines.push(`    - ${line.replace('### ', '').replace(/^\d+\.\s*/, '')}`);
          }
        }
      }

      // Extract the primitive / carry forward
      const primitive = extractSection(project.evaluation, 'The Primitive');
      const carry = extractSection(project.evaluation, 'Carry Forward');
      const summary = primitive || carry;
      if (summary) {
        lines.push('  Summary:');
        for (const line of summary.split('\n')) {
          if (line.trim()) lines.push(`    ${line.trim()}`);
        }
      }

      // External changes
      const external = extractSection(project.evaluation, 'Changes Outside');
      if (external && !external.includes('None')) {
        lines.push('  External changes:');
        for (const line of external.split('\n')) {
          if (line.trim().startsWith('-')) lines.push(`    ${line.trim()}`);
        }
      }
    } else if (project.latest) {
      lines.push('  (current project)');
    }

    lines.push('');
  }

  return lines.join('\n');
}
