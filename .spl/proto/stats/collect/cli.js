#!/usr/bin/env node
import { collect, format } from '../../.spl/proto/stats/stats.js';

const targetPath = process.argv[2] || '/';

try {
  const stats = await collect(targetPath);
  console.log(format(stats));
} catch (err) {
  console.error(`stats collect: ${err.message}`);
  process.exit(1);
}
