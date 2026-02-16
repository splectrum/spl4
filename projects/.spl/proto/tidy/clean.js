/**
 * tidy/clean — remove transient artifacts from projects.
 */

import { resolveTargets, tidySingle } from './lib.js';

export default async function (execDoc) {
  const dataList = await execDoc.resolve('mc.data/list');
  const coreDel = await execDoc.resolve('mc.core/del');

  return async function (path = '.') {
    const targets = await resolveTargets(dataList, path);
    const projects = [];
    for (const target of targets) {
      projects.push(await tidySingle(dataList, coreDel, target.path, 'clean'));
    }
    return { projects };
  };
}
