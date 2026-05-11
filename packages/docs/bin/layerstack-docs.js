#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsxBin = resolve(
	__dirname,
	process.platform === 'win32' ? '../node_modules/.bin/tsx.cmd' : '../node_modules/.bin/tsx'
);
const cliPath = resolve(__dirname, '../src/cli.ts');

const result = spawnSync(tsxBin, [cliPath, ...process.argv.slice(2)], {
	stdio: 'inherit'
});

process.exit(result.status ?? 1);
