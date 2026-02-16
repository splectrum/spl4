/**
 * mc.exec/create — start a new execution.
 *
 * Factory takes execDoc (needs .root), returns operator.
 * Operator takes (protocol, context), returns new exec doc.
 *
 * Faf drop: boundary entry.
 */

import { randomUUID } from 'node:crypto';
import { faf } from './lib.js';

export default async function (execDoc) {
  return function (protocol, context) {
    const uid = randomUUID();
    const timestamp = new Date().toISOString();

    const doc = {
      uid, protocol, context, root: execDoc.root,
      timestamp, status: 'running'
    };

    faf(doc);
    return doc;
  };
}
