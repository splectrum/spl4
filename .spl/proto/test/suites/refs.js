/**
 * Cascading reference tests.
 *
 * Sets up temporary directories as reference targets,
 * creates refs.json in a test context, verifies resolution,
 * stacking, list merging, and bucket operations.
 */

import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export const name = 'refs';

// Shared temp state
let refTarget1 = null;
let refTarget2 = null;
let testContextAddress = null;

async function setup(doc) {
  // Create two temp directories as reference targets (for stack testing)
  refTarget1 = await mkdtemp(join(tmpdir(), 'spl-ref-t1-'));
  refTarget2 = await mkdtemp(join(tmpdir(), 'spl-ref-t2-'));

  // Target 1: primary remote
  await writeFile(join(refTarget1, 'remote-file.md'), 'remote content');
  await mkdir(join(refTarget1, 'remote-subdir'));
  await writeFile(join(refTarget1, 'remote-subdir', 'nested.txt'), 'nested content');
  await writeFile(join(refTarget1, 'shared.txt'), 'from target 1');

  // Target 2: secondary remote (lower priority)
  await writeFile(join(refTarget2, 'shared.txt'), 'from target 2');
  await writeFile(join(refTarget2, 'only-in-t2.txt'), 'only in t2');

  // Create refs.json in projects/15-cascading-references/.spl/data/
  testContextAddress = join(doc.root, 'projects', '15-cascading-references');
  const dataDir = join(testContextAddress, '.spl', 'data');
  await mkdir(dataDir, { recursive: true });

  // Create a local directory to be hidden and referenced back
  const hiddenDir = join(testContextAddress, 'sealed-docs');
  await mkdir(hiddenDir, { recursive: true });
  await writeFile(join(hiddenDir, 'guide.txt'), 'sealed content');

  await writeFile(join(dataDir, 'refs.json'), JSON.stringify({
    'ref-file.md': [{ target: join(refTarget1, 'remote-file.md') }],
    'ref-dir': [{ target: refTarget1 }],
    'ref-subdir': [{ target: join(refTarget1, 'remote-subdir') }],
    'stacked': [
      { target: join(refTarget1, 'shared.txt') },
      { target: join(refTarget2, 'shared.txt') }
    ],
    'fallback': [
      { target: join(refTarget1, 'nonexistent.txt') },
      { target: join(refTarget2, 'only-in-t2.txt') }
    ],
    'sealed-docs': [{ target: hiddenDir }]
  }));

  await writeFile(join(dataDir, 'hidden.json'), JSON.stringify([
    'sealed-docs'
  ]));
}

async function teardown(doc) {
  // Clean up local overlays from copy-on-write tests
  await rm(join(testContextAddress, 'ref-dir'), { recursive: true, force: true });
  await rm(join(testContextAddress, 'sealed-docs'), { recursive: true, force: true });
  const dataDir = join(testContextAddress, '.spl', 'data');
  await rm(dataDir, { recursive: true, force: true });
  if (refTarget1) await rm(refTarget1, { recursive: true, force: true });
  if (refTarget2) await rm(refTarget2, { recursive: true, force: true });
}

export const tests = {
  // --- Setup ---

  async 'setup refs test fixtures'(doc, assert) {
    await setup(doc);
    assert.ok(refTarget1, 'temp dirs created');
  },

  // --- Phase 1: basic resolution ---

  async 'resolve file through reference'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/projects/15-cascading-references/ref-file.md');
    assert.equal(loc.type, 'file');
    assert.equal(loc.source, 'reference');
    assert.equal(loc.ref.name, 'ref-file.md');
    assert.equal(loc.ref.layer, 0);
  },

  async 'resolve directory through reference'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/projects/15-cascading-references/ref-dir');
    assert.equal(loc.type, 'directory');
    assert.equal(loc.source, 'reference');
  },

  async 'resolve nested path through reference'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/projects/15-cascading-references/ref-subdir/nested.txt');
    assert.equal(loc.type, 'file');
    assert.equal(loc.source, 'reference');
    assert.equal(loc.ref.name, 'ref-subdir');
  },

  async 'local shadows reference'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/projects/15-cascading-references/REQUIREMENTS.md');
    assert.equal(loc.source, 'local');
  },

  async 'existing paths have source local'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/CLAUDE.md');
    assert.equal(loc.source, 'local');
  },

  async 'nonexistent ref target rejects'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    await assert.rejects(
      () => resolve('/projects/15-cascading-references/totally-nonexistent'),
      'should reject when no reference matches'
    );
  },

  async 'read through reference'(doc, assert) {
    const read = await doc.resolve('mc.core/read');
    const buf = await read('/projects/15-cascading-references/ref-file.md');
    assert.equal(buf.toString(), 'remote content');
  },

  async 'read nested through reference'(doc, assert) {
    const read = await doc.resolve('mc.core/read');
    const buf = await read('/projects/15-cascading-references/ref-subdir/nested.txt');
    assert.equal(buf.toString(), 'nested content');
  },

  // --- Phase 2: stacked references ---

  async 'stacked resolve: first layer wins'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/projects/15-cascading-references/stacked');
    assert.equal(loc.source, 'reference');
    assert.equal(loc.ref.layer, 0);
    const read = await doc.resolve('mc.core/read');
    const buf = await read('/projects/15-cascading-references/stacked');
    assert.equal(buf.toString(), 'from target 1');
  },

  async 'stacked resolve: fallback to second layer'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const loc = await resolve('/projects/15-cascading-references/fallback');
    assert.equal(loc.source, 'reference');
    assert.equal(loc.ref.layer, 1);
    const read = await doc.resolve('mc.core/read');
    const buf = await read('/projects/15-cascading-references/fallback');
    assert.equal(buf.toString(), 'only in t2');
  },

  // --- Phase 2: bucket ---

  async 'bucket: single reference layer'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const layers = await resolve.bucket('/projects/15-cascading-references/ref-file.md');
    assert.equal(layers.length, 1);
    assert.equal(layers[0].source, 'reference');
  },

  async 'bucket: stacked shows all layers'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const layers = await resolve.bucket('/projects/15-cascading-references/stacked');
    assert.equal(layers.length, 2);
    assert.equal(layers[0].source, 'reference');
    assert.equal(layers[0].ref.layer, 0);
    assert.equal(layers[1].source, 'reference');
    assert.equal(layers[1].ref.layer, 1);
  },

  async 'bucket: local entry included'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const layers = await resolve.bucket('/projects/15-cascading-references/REQUIREMENTS.md');
    assert.ok(layers.length >= 1);
    assert.equal(layers[0].source, 'local');
  },

  // --- Phase 2: layers (info for mc.core/list) ---

  async 'layers: returns dirs, hidden, refs'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    const layers = await resolve.layers('/projects/15-cascading-references');
    assert.ok(layers.dirs.length >= 1, 'should have at least one directory layer');
    assert.equal(layers.dirs[0].source, 'local');
    assert.ok(layers.hidden instanceof Set, 'hidden should be a Set');
    assert.ok(typeof layers.refs === 'object', 'refs should be an object');
    assert.ok(layers.refs['ref-file.md'], 'refs should contain ref-file.md');
  },

  // --- Phase 3: mc.core/list merging ---

  async 'mc.core/list includes reference entries'(doc, assert) {
    const list = await doc.resolve('mc.core/list');
    const entries = await list('/projects/15-cascading-references');
    const refFile = entries.find(e => e.path.endsWith('/ref-file.md'));
    assert.ok(refFile, 'ref-file.md should appear in mc.core/list');
    assert.equal(refFile.source, 'reference');
  },

  async 'mc.core/list merges local and reference'(doc, assert) {
    const list = await doc.resolve('mc.core/list');
    const entries = await list('/projects/15-cascading-references');
    const local = entries.find(e => e.path.endsWith('/REQUIREMENTS.md'));
    const ref = entries.find(e => e.path.endsWith('/ref-file.md'));
    assert.ok(local, 'should have local entry');
    assert.ok(ref, 'should have reference entry');
    assert.equal(local.source, 'local');
    assert.equal(ref.source, 'reference');
  },

  // --- Phase 3: copy-on-write ---

  async 'copy-on-write: create in reference dir'(doc, assert) {
    const create = await doc.resolve('mc.core/create');
    const read = await doc.resolve('mc.core/read');
    const del = await doc.resolve('mc.core/del');

    // Create a file inside a referenced directory
    const loc = await create(
      '/projects/15-cascading-references/ref-dir',
      'cow-test.txt',
      Buffer.from('copy on write')
    );
    assert.equal(loc.source, 'local', 'created file should be local');

    // Read it back
    const buf = await read('/projects/15-cascading-references/ref-dir/cow-test.txt');
    assert.equal(buf.toString(), 'copy on write');

    // Clean up the local overlay (file + empty directory)
    await del('/projects/15-cascading-references/ref-dir/cow-test.txt');
    await del('/projects/15-cascading-references/ref-dir');
  },

  async 'copy-on-write: update reference file creates local'(doc, assert) {
    const update = await doc.resolve('mc.core/update');
    const read = await doc.resolve('mc.core/read');
    const resolve = await doc.resolve('mc.xpath/resolve');
    const del = await doc.resolve('mc.core/del');

    // ref-file.md currently resolves through reference
    const before = await resolve('/projects/15-cascading-references/ref-file.md');
    assert.equal(before.source, 'reference');

    // Update it — should create local copy
    await update('/projects/15-cascading-references/ref-file.md', Buffer.from('local override'));

    // Now resolves as local
    const after = await resolve('/projects/15-cascading-references/ref-file.md');
    assert.equal(after.source, 'local');

    // Content is the updated version
    const buf = await read('/projects/15-cascading-references/ref-file.md');
    assert.equal(buf.toString(), 'local override');

    // Delete the overlay — reference re-emerges
    await del('/projects/15-cascading-references/ref-file.md');
    const restored = await resolve('/projects/15-cascading-references/ref-file.md');
    assert.equal(restored.source, 'reference');

    // Original content back
    const original = await read('/projects/15-cascading-references/ref-file.md');
    assert.equal(original.toString(), 'remote content');
  },

  // --- Phase 3: write isolation ---

  async 'del rejects reference-only path'(doc, assert) {
    const del = await doc.resolve('mc.core/del');
    await assert.rejects(
      () => del('/projects/15-cascading-references/ref-file.md'),
      'should reject delete on reference-only path'
    );
  },

  // --- Phase 4: hiding mechanism ---

  async 'hidden: not resolvable by physical name'(doc, assert) {
    const resolve = await doc.resolve('mc.xpath/resolve');
    // sealed-docs exists locally but is hidden — resolves as reference
    const loc = await resolve('/projects/15-cascading-references/sealed-docs');
    assert.equal(loc.source, 'reference');
  },

  async 'hidden: accessible through reference'(doc, assert) {
    const read = await doc.resolve('mc.core/read');
    const buf = await read('/projects/15-cascading-references/sealed-docs/guide.txt');
    assert.equal(buf.toString(), 'sealed content');
  },

  async 'hidden: excluded from list'(doc, assert) {
    const list = await doc.resolve('mc.core/list');
    const entries = await list('/projects/15-cascading-references');
    const sealed = entries.find(e => e.path.endsWith('/sealed-docs'));
    assert.ok(sealed, 'sealed-docs should appear in list');
    assert.equal(sealed.source, 'reference', 'should appear as reference, not local');
  },

  async 'hidden: write rejected (reference-only)'(doc, assert) {
    const del = await doc.resolve('mc.core/del');
    await assert.rejects(
      () => del('/projects/15-cascading-references/sealed-docs'),
      'should reject delete on hidden+referenced path'
    );
  },

  // --- Phase 5: end-to-end (docs folder) ---

  async 'e2e: list docs shows referenced folders and files'(doc, assert) {
    const list = await doc.resolve('mc.data/list');
    const entries = await list('/projects/15-cascading-references/docs');
    const names = entries.map(e => e.path.split('/').pop());
    assert.ok(names.includes('PRINCIPLES.md'), 'has PRINCIPLES.md');
    assert.ok(names.includes('mycelium'), 'has mycelium');
    assert.ok(names.includes('splectrum'), 'has splectrum');
    assert.ok(names.includes('haicc'), 'has haicc');
    for (const e of entries) {
      assert.equal(e.source, 'reference', `${e.path.split('/').pop()} should be reference`);
    }
  },

  async 'e2e: read file through docs reference'(doc, assert) {
    const read = await doc.resolve('mc.core/read');
    const buf = await read('/projects/15-cascading-references/docs/PRINCIPLES.md');
    assert.ok(buf.toString().includes('Splectrum'), 'should read actual PRINCIPLES.md content');
  },

  async 'e2e: read nested through docs reference'(doc, assert) {
    const read = await doc.resolve('mc.core/read');
    const buf = await read('/projects/15-cascading-references/docs/mycelium/patterns.md');
    assert.ok(buf.toString().includes('P1'), 'should read patterns.md through reference');
  },

  async 'e2e: list nested reference directory'(doc, assert) {
    const list = await doc.resolve('mc.core/list');
    const entries = await list('/projects/15-cascading-references/docs/mycelium');
    const names = entries.map(e => e.path.split('/').pop());
    assert.ok(names.includes('patterns.md'), 'mycelium/ should list patterns.md');
    assert.ok(names.includes('model.md'), 'mycelium/ should list model.md');
  },

  async 'e2e: flat list through docs references'(doc, assert) {
    const list = await doc.resolve('mc.data/list');
    const entries = await list('/projects/15-cascading-references/docs', { depth: -1 });
    const names = entries.map(e => e.path.split('/').pop());
    // Should include files from inside referenced folders
    assert.ok(names.includes('patterns.md'), 'should flatten into mycelium/');
    assert.ok(names.includes('model.md'), 'should flatten into mycelium/');
    assert.ok(names.includes('quality-gates.md'), 'should flatten into splectrum/');
    assert.ok(names.includes('spawn.md'), 'should flatten into haicc/');
    // Top-level referenced files should also be present
    assert.ok(names.includes('PRINCIPLES.md'), 'should include referenced files');
  },

  async 'e2e: copy-on-write in docs'(doc, assert) {
    const update = await doc.resolve('mc.core/update');
    const read = await doc.resolve('mc.core/read');
    const resolve = await doc.resolve('mc.xpath/resolve');
    const del = await doc.resolve('mc.core/del');

    // Update PRINCIPLES.md — should create local copy
    await update('/projects/15-cascading-references/docs/PRINCIPLES.md', Buffer.from('local draft'));
    const loc = await resolve('/projects/15-cascading-references/docs/PRINCIPLES.md');
    assert.equal(loc.source, 'local', 'updated file should be local');
    const buf = await read('/projects/15-cascading-references/docs/PRINCIPLES.md');
    assert.equal(buf.toString(), 'local draft');

    // Delete local overlay — reference re-emerges
    await del('/projects/15-cascading-references/docs/PRINCIPLES.md');
    const restored = await resolve('/projects/15-cascading-references/docs/PRINCIPLES.md');
    assert.equal(restored.source, 'reference', 'reference should re-emerge');
  },

  // --- Teardown ---

  async 'teardown refs test fixtures'(doc, assert) {
    await teardown(doc);
    assert.ok(true, 'cleaned up');
  },
};
