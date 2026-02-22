/**
 * mc.core operation tests.
 */

export const name = 'mc.core';

export const tests = {
  async 'list root'(doc, assert) {
    const list = await doc.resolve('mc.core/list');
    const entries = await list('/');
    assert.ok(Array.isArray(entries), 'list should return array');
    assert.ok(entries.length > 0, 'root should have entries');
  },

  async 'list with depth'(doc, assert) {
    const list = await doc.resolve('mc.core/list');
    const shallow = await list('/projects', { depth: 0 });
    const deep = await list('/projects', { depth: -1 });
    assert.ok(deep.length >= shallow.length, 'deep should have >= shallow entries');
  },

  async 'read file'(doc, assert) {
    const read = await doc.resolve('mc.core/read');
    const buf = await read('/CLAUDE.md');
    assert.ok(Buffer.isBuffer(buf), 'read should return Buffer');
    assert.ok(buf.length > 0, 'CLAUDE.md should not be empty');
  },

  async 'read rejects directory'(doc, assert) {
    const read = await doc.resolve('mc.core/read');
    await assert.rejects(
      () => read('/projects'),
      'read should reject directories'
    );
  },

  async 'create and del'(doc, assert) {
    const create = await doc.resolve('mc.core/create');
    const del = await doc.resolve('mc.core/del');
    const read = await doc.resolve('mc.core/read');

    // Create a test file
    const loc = await create('/', '_test_file.tmp', Buffer.from('test'));
    assert.equal(loc.type, 'file');

    // Verify it's readable
    const content = await read('/_test_file.tmp');
    assert.equal(content.toString(), 'test');

    // Clean up
    await del('/_test_file.tmp');

    // Verify it's gone
    await assert.rejects(
      () => read('/_test_file.tmp'),
      'should be deleted'
    );
  },

  async 'update file'(doc, assert) {
    const create = await doc.resolve('mc.core/create');
    const update = await doc.resolve('mc.core/update');
    const read = await doc.resolve('mc.core/read');
    const del = await doc.resolve('mc.core/del');

    await create('/', '_test_update.tmp', Buffer.from('original'));
    await update('/_test_update.tmp', Buffer.from('updated'));
    const content = await read('/_test_update.tmp');
    assert.equal(content.toString(), 'updated');
    await del('/_test_update.tmp');
  },
};
