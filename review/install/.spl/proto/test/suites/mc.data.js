/**
 * mc.data operation tests.
 */

export const name = 'mc.data';

export const tests = {
  async 'list excludes .spl'(doc, assert) {
    const list = await doc.resolve('mc.data/list');
    const entries = await list('/');
    const splEntries = entries.filter(e => e.path.split('/').includes('.spl'));
    assert.equal(splEntries.length, 0, '.spl entries should be excluded');
  },

  async 'read rejects .spl path'(doc, assert) {
    const read = await doc.resolve('mc.data/read');
    await assert.rejects(
      () => read('/.spl/spl.mjs'),
      'should reject .spl paths'
    );
  },

  async 'create rejects .spl key'(doc, assert) {
    const create = await doc.resolve('mc.data/create');
    await assert.rejects(
      () => create('/', '.spl', Buffer.from('test')),
      'should reject .spl key'
    );
  },
};
