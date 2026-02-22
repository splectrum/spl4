/**
 * mc.raw/update — change existing file with format detection.
 *
 * raw.update(path, Buffer)  -> binary
 * raw.update(path, string)  -> utf-8
 * raw.update(path, object)  -> JSON
 */

export default async function (execDoc) {
  const coreUpdate = await execDoc.resolve('mc.core/update');

  return async function (path, content) {
    return coreUpdate(path, toBuffer(content));
  };
}

function toBuffer(content) {
  if (content === undefined) return undefined;
  if (Buffer.isBuffer(content)) return content;
  if (typeof content === 'string') return Buffer.from(content, 'utf-8');
  return Buffer.from(JSON.stringify(content, null, 2), 'utf-8');
}
