#!/usr/bin/env node
import { collect, format } from './stats.js';

const [, , targetPath] = process.argv;

if (!targetPath) {
  console.log(`stats — context statistics

Usage: spl stats <path>

Counts files, directories, lines, and bytes
in the target context (excludes .spl).`);
  process.exit(0);
}

try {
  const stats = await collect(targetPath);
  console.log(format(stats));
} catch (err) {
  console.error(`stats: ${err.message}`);
  process.exit(1);
}
