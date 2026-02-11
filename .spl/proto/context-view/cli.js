#!/usr/bin/env node
import { scan, formatScan } from './scan.js';
import { buildPrompt, writePrompt, invoke } from './haiccer.js';
import { persist } from './persist.js';
const [, , command, ...args] = process.argv;
function help() {
    console.log(`context-view — context description generator

Commands:
  scan [path]     Print scan result to stdout
  prompt [path]   Generate haiccer prompt (saves to .context-view/)
  sync [path]     Full pipeline: scan → haiccer → persist CONTEXT.md
  help            Show this help`);
}
try {
    const from = args[0] || process.cwd();
    switch (command) {
        case 'scan': {
            const result = scan(from);
            console.log(formatScan(result));
            break;
        }
        case 'prompt': {
            const result = scan(from);
            const prompt = buildPrompt(result);
            const path = writePrompt(result.root, prompt);
            console.log(`Prompt written: ${path}`);
            break;
        }
        case 'sync': {
            const result = scan(from);
            const prompt = buildPrompt(result);
            const promptPath = writePrompt(result.root, prompt);
            console.log('Invoking haiccer...');
            const content = invoke(promptPath);
            const contextPath = persist(result.root, content);
            console.log(`Updated: ${contextPath}`);
            break;
        }
        case 'help':
        case undefined:
            help();
            break;
        default:
            console.error(`Unknown command: ${command}`);
            help();
            process.exit(1);
    }
}
catch (err) {
    console.error(err.message);
    process.exit(1);
}
