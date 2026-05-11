#!/usr/bin/env node

import path from 'node:path';
import { writeComponentAPIs } from './lib/node/component-api.js';
import { writeExampleCatalogs } from './lib/node/example-catalog.js';
import { generateScreenshots } from './lib/node/screenshots.js';
import { generateStackBlitzFiles } from './lib/node/stackblitz.js';
import { generateReleases } from './lib/node/releases.js';

const [, , command, ...args] = process.argv;

function resolvePath(value: string) {
	return path.resolve(process.cwd(), value);
}

function readFlag(name: string): string | undefined {
	const index = args.indexOf(name);
	if (index === -1) return undefined;
	return args[index + 1];
}

function hasFlag(name: string) {
	return args.includes(name);
}

function readMappings(flag: string) {
	const mappings: Record<string, string> = {};
	for (let i = 0; i < args.length; i++) {
		if (args[i] !== flag) continue;
		const value = args[i + 1];
		if (!value) throw new Error(`Missing value after ${flag}`);
		const [outputPath, sourcePath] = value.split('=');
		if (!outputPath || !sourcePath) {
			throw new Error(`${flag} expects output=source, received "${value}"`);
		}
		mappings[outputPath] = sourcePath;
		i++;
	}
	return mappings;
}

function help() {
	console.log(`Usage:
  layerstack-docs generate-api <components-dir> <output-dir>
  layerstack-docs generate-catalog <components-dir> <examples-dir> <catalog-dir>
  layerstack-docs generate-screenshots <examples-dir> <screenshots-dir> [--base-url <url>] [--route-base <path>] [--all]
  layerstack-docs generate-stackblitz <template-dir> <source-dir> <output-file> [remote-sources-file] [--source output=source] [--remote output=source]
  layerstack-docs generate-releases <owner/repo> <output-dir>`);
}

async function main() {
	if (!command || command === '--help' || command === '-h') {
		help();
		return;
	}

	if (command === 'generate-api') {
		const [componentsDir, outputDir] = args;
		if (!componentsDir || !outputDir) throw new Error('generate-api requires <components-dir> <output-dir>');
		writeComponentAPIs({
			componentsDir: resolvePath(componentsDir),
			outputDir: resolvePath(outputDir)
		});
		return;
	}

	if (command === 'generate-catalog') {
		const [componentsDir, examplesDir, catalogDir] = args;
		if (!componentsDir || !examplesDir || !catalogDir) {
			throw new Error('generate-catalog requires <components-dir> <examples-dir> <catalog-dir>');
		}
		await writeExampleCatalogs({
			title: 'Example Catalog Generator',
			componentsDir: resolvePath(componentsDir),
			examplesDir: resolvePath(examplesDir),
			catalogDir: resolvePath(catalogDir)
		});
		return;
	}

	if (command === 'generate-screenshots') {
		const [examplesDir, screenshotsDir] = args;
		if (!examplesDir || !screenshotsDir) {
			throw new Error('generate-screenshots requires <examples-dir> <screenshots-dir>');
		}
		await generateScreenshots({
			examplesDir: resolvePath(examplesDir),
			screenshotsDir: resolvePath(screenshotsDir),
			baseUrl: readFlag('--base-url'),
			routeBase: readFlag('--route-base'),
			forceAll: hasFlag('--all')
		});
		return;
	}

	if (command === 'generate-stackblitz') {
		const [templateDir, sourceDir, outputFile, remoteSourcesFile] = args;
		if (!templateDir || !sourceDir || !outputFile) {
			throw new Error(
				'generate-stackblitz requires <template-dir> <source-dir> <output-file> [remote-sources-file]'
			);
		}
		generateStackBlitzFiles({
			templateDir: resolvePath(templateDir),
			sourceDir: resolvePath(sourceDir),
			outputFile: resolvePath(outputFile),
			remoteSourcesFile:
				remoteSourcesFile && !remoteSourcesFile.startsWith('--')
					? resolvePath(remoteSourcesFile)
					: undefined,
			sources: readMappings('--source'),
			remoteSources: readMappings('--remote')
		});
		return;
	}

	if (command === 'generate-releases') {
		const [repo, outputDir] = args;
		if (!repo || !outputDir) throw new Error('generate-releases requires <owner/repo> <output-dir>');
		await generateReleases({
			repo,
			outputDir: resolvePath(outputDir)
		});
		return;
	}

	throw new Error(`Unknown command "${command}"`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
