/**
 * Compound operation tests: mc.raw/move, mc.raw/copy, changelog.
 */

export const name = 'compound';

const TEST_DIR = '/projects/18-compound-ops';
const TEST_FILE = '_test_compound.txt';
const TEST_CONTENT = 'compound ops test content';

export const tests = {
  async 'setup test file'(doc, assert) {
    const create = await doc.resolve('mc.raw/create');
    await create(TEST_DIR, TEST_FILE, TEST_CONTENT);
    const read = await doc.resolve('mc.raw/read');
    const content = await read(`${TEST_DIR}/${TEST_FILE}`, 'utf-8');
    assert.equal(content, TEST_CONTENT);
  },

  async 'copy creates independent duplicate'(doc, assert) {
    const copy = await doc.resolve('mc.raw/copy');
    const read = await doc.resolve('mc.raw/read');

    const loc = await copy(`${TEST_DIR}/${TEST_FILE}`, TEST_DIR, '_test_copied.txt');
    assert.equal(loc.type, 'file');

    // Both files exist with same content
    const original = await read(`${TEST_DIR}/${TEST_FILE}`, 'utf-8');
    const copied = await read(`${TEST_DIR}/_test_copied.txt`, 'utf-8');
    assert.equal(original, TEST_CONTENT);
    assert.equal(copied, TEST_CONTENT);
  },

  async 'copy is git-staged'(doc, assert) {
    const status = await doc.resolve('git/status');
    const result = status('projects/18-compound-ops');
    const copied = result.files.find(f => f.file.includes('_test_copied.txt'));
    assert.ok(copied, 'copied file should appear in git status');
  },

  async 'move relocates file'(doc, assert) {
    const move = await doc.resolve('mc.raw/move');
    const read = await doc.resolve('mc.raw/read');

    const loc = await move(`${TEST_DIR}/${TEST_FILE}`, TEST_DIR, '_test_moved.txt');
    assert.equal(loc.type, 'file');

    // New path readable
    const content = await read(`${TEST_DIR}/_test_moved.txt`, 'utf-8');
    assert.equal(content, TEST_CONTENT);

    // Original gone
    await assert.rejects(
      () => read(`${TEST_DIR}/${TEST_FILE}`, 'utf-8'),
      'original should not exist after move'
    );
  },

  async 'move is git-staged'(doc, assert) {
    const status = await doc.resolve('git/status');
    const result = status('projects/18-compound-ops');
    const moved = result.files.find(f => f.file.includes('_test_moved.txt'));
    assert.ok(moved, 'moved file should appear in git status');
  },

  async 'move rejects reference source'(doc, assert) {
    const move = await doc.resolve('mc.raw/move');
    // process/ is a reference in project 16
    await assert.rejects(
      () => move('/projects/16-process-standards/process/req-project.md', TEST_DIR, '_ref_move.txt'),
      'should reject moving a reference'
    );
  },

  async 'copy works through reference'(doc, assert) {
    const copy = await doc.resolve('mc.raw/copy');
    const read = await doc.resolve('mc.raw/read');

    // Copy from a reference source (process/ in project 16)
    const loc = await copy(
      '/projects/16-process-standards/process/req-project.md',
      TEST_DIR, '_test_ref_copy.txt'
    );
    assert.equal(loc.type, 'file');

    const content = await read(`${TEST_DIR}/_test_ref_copy.txt`, 'utf-8');
    assert.ok(content.includes('Requirements: Project'), 'should have copied reference content');
  },

  async 'changelog shows project history'(doc, assert) {
    const changelog = await doc.resolve('git/changelog');
    const md = changelog('projects/', '10');
    assert.ok(md.includes('Changelog: projects/'), 'should have heading');
    assert.ok(md.includes('- **'), 'should have entries');
  },

  async 'teardown test files'(doc, assert) {
    const del = await doc.resolve('mc.raw/del');
    try { await del(`${TEST_DIR}/_test_moved.txt`); } catch { /* ok */ }
    try { await del(`${TEST_DIR}/_test_copied.txt`); } catch { /* ok */ }
    try { await del(`${TEST_DIR}/_test_ref_copy.txt`); } catch { /* ok */ }
    // Unstage test files
    const { execSync } = await import('node:child_process');
    execSync('git checkout -- . 2>/dev/null; git reset HEAD -- projects/18-compound-ops/_test* 2>/dev/null', {
      cwd: doc.root,
      encoding: 'utf-8',
      stdio: 'ignore',
    });
    assert.ok(true, 'cleanup done');
  },
};
