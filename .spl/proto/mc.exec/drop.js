/**
 * mc.exec/drop — persist the doc at this moment.
 *
 * Internal step capture. The full doc is written —
 * not a delta, not an event. Complete state at this
 * point. Fire and forget.
 */

import { faf } from './lib.js';

export default async function () {
  return function (doc) {
    faf(doc);
  };
}
