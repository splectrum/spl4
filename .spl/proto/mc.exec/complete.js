/**
 * mc.exec/complete — mark execution as completed.
 *
 * Faf drop: boundary exit.
 */

import { faf } from './lib.js';

export default async function () {
  return function (doc) {
    doc.status = 'completed';
    doc.completedAt = new Date().toISOString();
    faf(doc);
  };
}
