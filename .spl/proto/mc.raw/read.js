/**
 * mc.raw/read — file content with optional format interpretation.
 *
 * raw.read(path)          -> Buffer
 * raw.read(path, 'utf-8') -> string
 * raw.read(path, 'json')  -> parsed object
 */

export default async function (execDoc) {
  const coreRead = await execDoc.resolve('mc.core/read');

  return async function (path, format) {
    const buf = await coreRead(path);
    if (!format) return buf;
    if (format === 'utf-8') return buf.toString('utf-8');
    if (format === 'json') return JSON.parse(buf.toString('utf-8'));
    throw new Error(`mc.raw.read: unknown format: ${format}`);
  };
}
