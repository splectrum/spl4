/**
 * mc.raw/create — make a new entry with format detection.
 *
 * raw.create(parent, key, Buffer)  -> binary
 * raw.create(parent, key, string)  -> utf-8
 * raw.create(parent, key, object)  -> JSON
 * raw.create(parent, key)          -> directory
 */

export default async function (execDoc) {
  const coreCreate = await execDoc.resolve('mc.core/create');

  return async function (parentPath, key, content) {
    return coreCreate(parentPath, key, toBuffer(content));
  };
}

function toBuffer(content) {
  if (content === undefined) return undefined;
  if (Buffer.isBuffer(content)) return content;
  if (typeof content === 'string') return Buffer.from(content, 'utf-8');
  return Buffer.from(JSON.stringify(content, null, 2), 'utf-8');
}
