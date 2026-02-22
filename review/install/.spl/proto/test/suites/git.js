/**
 * git protocol tests.
 */

export const name = 'git';

export const tests = {
  async 'status returns structured data'(doc, assert) {
    const status = await doc.resolve('git/status');
    const result = status('.');
    assert.ok(result.files !== undefined, 'result should have files');
    assert.ok(Array.isArray(result.files), 'files should be array');
    assert.type(result.clean, 'boolean', 'clean should be boolean');
  },

  async 'status scoped to path'(doc, assert) {
    const status = await doc.resolve('git/status');
    const result = status('projects/');
    assert.ok(result.files !== undefined, 'scoped result should have files');
    for (const f of result.files) {
      assert.ok(f.file.startsWith('projects/'), `file should be under projects/: ${f.file}`);
    }
  },

  async 'log returns structured commits'(doc, assert) {
    const log = await doc.resolve('git/log');
    const entries = log('.', '5');
    assert.ok(Array.isArray(entries), 'log should return array');
    assert.ok(entries.length > 0, 'should have commits');
    const first = entries[0];
    assert.ok(first.hash, 'commit should have hash');
    assert.ok(first.short, 'commit should have short hash');
    assert.ok(first.author, 'commit should have author');
    assert.ok(first.date, 'commit should have date');
    assert.ok(first.message, 'commit should have message');
  },

  async 'log scoped to path'(doc, assert) {
    const log = await doc.resolve('git/log');
    const entries = log('process/', '3');
    assert.ok(Array.isArray(entries), 'scoped log should return array');
    assert.ok(entries.length > 0, 'process/ should have commits');
  },

  async 'changelog produces markdown'(doc, assert) {
    const changelog = await doc.resolve('git/changelog');
    const md = changelog('.', '3');
    assert.type(md, 'string', 'changelog should return string');
    assert.ok(md.startsWith('# Changelog'), 'should start with heading');
    assert.ok(md.includes('`'), 'should include commit hashes');
  },

  async 'changelog scoped to path'(doc, assert) {
    const changelog = await doc.resolve('git/changelog');
    const md = changelog('projects/', '3');
    assert.ok(md.includes('Changelog: projects/'), 'heading should include path');
  },

  async 'checkpoint rejects missing path'(doc, assert) {
    const checkpoint = await doc.resolve('git/checkpoint');
    assert.throws(
      () => checkpoint(null, 'test'),
      'should reject missing path'
    );
  },

  async 'checkpoint rejects missing message'(doc, assert) {
    const checkpoint = await doc.resolve('git/checkpoint');
    assert.throws(
      () => checkpoint('.', null),
      'should reject missing message'
    );
  },
};
