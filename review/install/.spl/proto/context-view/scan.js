/**
 * context-view/scan — scan only (inspection).
 *
 * Returns structured scan data without invoking haiccer.
 */

import { doScan } from './lib.js';

export default async function (execDoc) {
  const dataList = await execDoc.resolve('mc.data/list');
  const rawRead = await execDoc.resolve('mc.raw/read');

  return async function () {
    return await doScan(dataList, rawRead, execDoc.root);
  };
}
