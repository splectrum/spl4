/**
 * Boot and resolve tests.
 */

export const name = 'boot';

export const tests = {
  async 'doc has root'(doc, assert) {
    assert.ok(doc.root, 'doc should have root');
    assert.type(doc.root, 'string');
  },

  async 'doc has map'(doc, assert) {
    assert.ok(doc.map, 'doc should have map');
    assert.ok(Object.keys(doc.map).length > 0, 'map should not be empty');
  },

  async 'doc has resolve'(doc, assert) {
    assert.type(doc.resolve, 'function');
  },

  async 'doc has resolvePath'(doc, assert) {
    assert.type(doc.resolvePath, 'function');
  },

  async 'doc has prefix'(doc, assert) {
    assert.ok(doc.prefix !== undefined, 'doc should have prefix');
  },

  async 'resolve caches operators'(doc, assert) {
    const a = await doc.resolve('mc.xpath/resolve');
    const b = await doc.resolve('mc.xpath/resolve');
    assert.ok(a === b, 'resolve should return same cached operator');
  },

  async 'resolve rejects unknown key'(doc, assert) {
    await assert.rejects(
      () => doc.resolve('nonexistent/operation'),
      'should reject unknown key'
    );
  },

  async 'resolvePath from root'(doc, assert) {
    // When prefix is '.', resolvePath should work
    if (doc.prefix === '.') {
      const result = doc.resolvePath('projects/14-bug-fixes');
      assert.equal(result, '/projects/14-bug-fixes');
    }
  },
};
