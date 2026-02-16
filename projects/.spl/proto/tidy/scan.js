/**
 * tidy/scan — find transient artifacts in projects.
 */

import { resolveTargets, tidySingle } from './lib.js';

export default async function (execDoc) {
  const dataList = await execDoc.resolve('mc.data/list');

  return async function (path = '.') {
    const targets = await resolveTargets(dataList, path);
    const projects = [];
    for (const target of targets) {
      projects.push(await tidySingle(dataList, null, target.path, 'scan'));
    }
    return { projects };
  };
}
