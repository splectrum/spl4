/**
 * mc.data/create — make a new entry. Errors on .spl paths.
 */

export default async function (execDoc) {
  const coreCreate = await execDoc.resolve('mc.core/create');

  return async function (parentPath, key, content) {
    if (key === '.spl' || key.startsWith('.spl/')) {
      throw new Error(`mc.data.create: .spl paths excluded: ${key}`);
    }
    if (parentPath.split('/').includes('.spl')) {
      throw new Error(`mc.data.create: .spl paths excluded: ${parentPath}`);
    }
    return coreCreate(parentPath, key, content);
  };
}
