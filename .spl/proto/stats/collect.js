/**
 * stats/collect — context statistics.
 *
 * Read-only. Counts files, directories, lines, bytes
 * for a target path.
 */

export default async function (execDoc) {
  const dataList = await execDoc.resolve('mc.data/list');
  const rawRead = await execDoc.resolve('mc.raw/read');

  return async function (targetPath = '/') {
    const entries = await dataList(targetPath, { depth: -1 });
    const files = entries.filter(e => e.type === 'file');
    const directories = entries.filter(e => e.type === 'directory');

    let totalLines = 0;
    let totalBytes = 0;
    const details = [];

    for (const file of files) {
      try {
        const content = await rawRead(file.path, 'utf-8');
        const lines = content.split('\n').length;
        const bytes = Buffer.byteLength(content, 'utf-8');
        totalLines += lines;
        totalBytes += bytes;
        details.push({ path: file.path, lines, bytes });
      } catch {
        const buf = await rawRead(file.path);
        totalBytes += buf.length;
        details.push({ path: file.path, lines: 0, bytes: buf.length, binary: true });
      }
    }

    return {
      path: targetPath,
      files: files.length,
      directories: directories.length,
      lines: totalLines,
      bytes: totalBytes,
      details
    };
  };
}
