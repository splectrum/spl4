/**
 * Evaluator process compliance tests.
 *
 * Tests the compliance discovery mechanism:
 * finding process requirements through references
 * and determining which apply.
 */

export const name = 'compliance';

export const tests = {
  async 'process ref accessible from project 16'(doc, assert) {
    const list = await doc.resolve('mc.data/list');
    const entries = await list('/projects/16-process-standards/process');
    assert.ok(entries.length > 0, 'process/ should be listable through reference');
    const names = entries.map(e => e.path.split('/').pop());
    assert.ok(names.includes('req-project.md'), 'should find req-project.md');
    assert.ok(names.includes('req-build-cycle.md'), 'should find req-build-cycle.md');
  },

  async 'process ref accessible from project 17'(doc, assert) {
    const list = await doc.resolve('mc.data/list');
    const entries = await list('/projects/17-evaluator-git/process');
    assert.ok(entries.length > 0, 'process/ should be listable through reference');
    const names = entries.map(e => e.path.split('/').pop());
    assert.ok(names.includes('req-requirements.md'), 'should find req-requirements.md');
  },

  async 'req files readable through reference'(doc, assert) {
    const read = await doc.resolve('mc.raw/read');
    const content = await read('/projects/16-process-standards/process/req-project.md', 'utf-8');
    assert.ok(content.includes('# Requirements: Project'), 'should read req content');
    assert.ok(content.includes('## R1'), 'should have R-numbered requirements');
  },

  async 'all five req files present'(doc, assert) {
    const list = await doc.resolve('mc.data/list');
    const entries = await list('/projects/17-evaluator-git/process');
    const reqFiles = entries
      .filter(e => e.path.split('/').pop().startsWith('req-'))
      .map(e => e.path.split('/').pop());
    assert.equal(reqFiles.length, 5, `expected 5 req files, got ${reqFiles.length}`);
    const expected = [
      'req-build-cycle.md', 'req-evaluation.md',
      'req-project.md', 'req-quality-gates.md', 'req-requirements.md'
    ];
    for (const name of expected) {
      assert.ok(reqFiles.includes(name), `missing ${name}`);
    }
  },
};
