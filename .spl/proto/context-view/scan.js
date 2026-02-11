import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
/** Find repo root by walking up looking for CLAUDE.md */
function findRoot(from) {
    let dir = resolve(from);
    while (true) {
        if (existsSync(join(dir, 'CLAUDE.md')))
            return dir;
        const parent = resolve(dir, '..');
        if (parent === dir)
            throw new Error('Not in a repo (no CLAUDE.md found)');
        dir = parent;
    }
}
/** Meaningful records — markdown files we read for content */
const MEANINGFUL = new Set(['REQUIREMENTS.md', 'EVALUATION.md']);
/** List files in a directory (non-recursive, skip hidden) */
function listFiles(dir) {
    return readdirSync(dir)
        .filter(e => !e.startsWith('.') && statSync(join(dir, e)).isFile());
}
/** Scan the repo and collect structured data */
export function scan(from = process.cwd()) {
    const root = findRoot(from);
    const claudePath = join(root, 'CLAUDE.md');
    const claudeMd = existsSync(claudePath)
        ? readFileSync(claudePath, 'utf-8')
        : null;
    const projectsDir = join(root, 'projects');
    const projects = [];
    if (existsSync(projectsDir)) {
        const entries = readdirSync(projectsDir).sort()
            .filter(e => statSync(join(projectsDir, e)).isDirectory());
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const projectDir = join(projectsDir, entry);
            const files = listFiles(projectDir);
            // Read meaningful records
            const records = [];
            for (const file of files) {
                if (MEANINGFUL.has(file)) {
                    records.push({
                        name: file,
                        content: readFileSync(join(projectDir, file), 'utf-8'),
                    });
                }
            }
            projects.push({
                key: entry,
                files,
                records,
                latest: i === entries.length - 1,
            });
        }
    }
    return { root, claudeMd, projects };
}
/** Format scan result as text for the hiaccer */
export function formatScan(result) {
    const lines = [];
    lines.push('# Scan Result');
    lines.push('');
    if (result.claudeMd) {
        lines.push('## CLAUDE.md');
        lines.push('');
        lines.push(result.claudeMd);
        lines.push('');
    }
    lines.push(`## Projects (${result.projects.length})`);
    lines.push('');
    for (const project of result.projects) {
        const status = project.latest ? '(current)' : '(completed)';
        lines.push(`### ${project.key} ${status}`);
        lines.push('');
        lines.push(`Files: ${project.files.join(', ')}`);
        lines.push('');
        for (const record of project.records) {
            lines.push(`#### ${record.name}`);
            lines.push('');
            lines.push(record.content);
            lines.push('');
        }
    }
    return lines.join('\n');
}
