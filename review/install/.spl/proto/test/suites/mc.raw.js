/**
 * mc.raw operation tests.
 */

export const name = 'mc.raw';

export const tests = {
  async 'read as buffer'(doc, assert) {
    const read = await doc.resolve('mc.raw/read');
    const buf = await read('/CLAUDE.md');
    assert.ok(Buffer.isBuffer(buf), 'default read should return Buffer');
  },

  async 'read as utf-8'(doc, assert) {
    const read = await doc.resolve('mc.raw/read');
    const text = await read('/CLAUDE.md', 'utf-8');
    assert.type(text, 'string', 'utf-8 read should return string');
    assert.ok(text.includes('Splectrum'), 'should contain Splectrum');
  },

  async 'read as json'(doc, assert) {
    const read = await doc.resolve('mc.raw/read');
    // Read a known JSON file
    const obj = await read('/.spl/proto/mc.xpath/resolve/config.json', 'json');
    assert.ok(obj.module, 'should have module field');
  },

  async 'create with string (utf-8 detection)'(doc, assert) {
    const create = await doc.resolve('mc.raw/create');
    const read = await doc.resolve('mc.raw/read');
    const del = await doc.resolve('mc.core/del');

    await create('/', '_test_raw.tmp', 'hello utf-8');
    const text = await read('/_test_raw.tmp', 'utf-8');
    assert.equal(text, 'hello utf-8');
    await del('/_test_raw.tmp');
  },

  async 'create with object (json detection)'(doc, assert) {
    const create = await doc.resolve('mc.raw/create');
    const read = await doc.resolve('mc.raw/read');
    const del = await doc.resolve('mc.core/del');

    await create('/', '_test_raw_json.tmp', { key: 'value' });
    const obj = await read('/_test_raw_json.tmp', 'json');
    assert.equal(obj.key, 'value');
    await del('/_test_raw_json.tmp');
  },
};
