/**
 * mc.xpath/resolve tests.
 */

export const name = 'mc.xpath';

export const tests = {
  async 'resolve root'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/');
    assert.equal(loc.path, '/');
    assert.equal(loc.type, 'directory');
    assert.equal(loc.state, 'real');
  },

  async 'resolve existing directory'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/projects');
    assert.equal(loc.path, '/projects');
    assert.equal(loc.type, 'directory');
  },

  async 'resolve existing file'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/CLAUDE.md');
    assert.equal(loc.path, '/CLAUDE.md');
    assert.equal(loc.type, 'file');
  },

  async 'reject nonexistent path'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    await assert.rejects(
      () => resolve('/does-not-exist-xyz'),
      'should reject nonexistent path'
    );
  },

  async 'normalise paths'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const a = await resolve('/');
    const b = await resolve('.');
    const c = await resolve('');
    assert.equal(a.path, b.path);
    assert.equal(b.path, c.path);
  },
};
