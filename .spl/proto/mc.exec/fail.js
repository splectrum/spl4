/**
 * mc.exec/fail — mark execution as failed.
 *
 * Faf drop: boundary exit.
 */

import { faf } from './lib.js';

export default async function () {
  return function (doc, error = null) {
    doc.status = 'failed';
    doc.failedAt = new Date().toISOString();
    if (error) doc.error = error;
    faf(doc);
  };
}
