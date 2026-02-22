/**
 * Requirements parser tests.
 */

import { parseRequirements } from '../../evaluate/parser.js';

export const name = 'parser';

export const tests = {
  async 'parse R-numbered format'(doc, assert) {
    const md = `# Test
## Goal
Something.
### R1: First
Some text.
### R2: Second
More text.
## Quality Gates
- Gate one
- Gate two
`;
    const reqs = parseRequirements(md);
    assert.equal(reqs.length, 2);
    assert.equal(reqs[0].id, 'R1');
    assert.equal(reqs[1].id, 'R2');
  },

  async 'parse section format'(doc, assert) {
    const md = `# Test
## Section One
1. First gate
2. Second gate
## Section Two
1. Third gate
`;
    const reqs = parseRequirements(md);
    assert.equal(reqs.length, 2);
    assert.equal(reqs[0].id, 'S1');
    assert.equal(reqs[0].gates.length, 2);
    assert.equal(reqs[1].gates.length, 1);
  },

  async 'multi-line numbered items'(doc, assert) {
    const md = `# Test
## Section One
1. First gate that spans
   multiple lines
2. Second gate
`;
    const reqs = parseRequirements(md);
    assert.equal(reqs[0].gates.length, 2);
    assert.ok(reqs[0].gates[0].includes('multiple lines'),
      'should capture continuation line');
  },

  async 'multi-line bullet gates'(doc, assert) {
    const md = `# Test
### R1: First
Some text.
## Quality Gates
- Gate that spans
  multiple lines
- Simple gate
`;
    const reqs = parseRequirements(md);
    assert.equal(reqs[0].gates.length, 2);
    assert.ok(reqs[0].gates[0].includes('multiple lines'),
      'should capture bullet continuation');
  },
};
