/**
 * Shared utilities for StackBlitz and WebContainer file operations (Node.js/server-side only)
 */

import type { FileSystemTree } from '@webcontainer/api';

// Node.js imports
import fs from 'fs';
import path from 'path';

/**
 * Recursively read all files from a directory and return them as a flat object
 * with relative paths as keys and file contents as values
 *
 * Note: This is only available in Node.js context (build scripts)
 */
export function readAllFilesFromDirectory(
	dir: string,
	baseDir: string = dir
): Record<string, string> {
	const files: Record<string, string> = {};

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			// Recursively read subdirectories
			Object.assign(files, readAllFilesFromDirectory(fullPath, baseDir));
		} else if (entry.isFile()) {
			// Skip README.md and .gitignore as they're not needed in the project
			if (entry.name === 'README.md' || entry.name === '.gitignore') {
				continue;
			}

			// Get relative path from base directory
			const relativePath = path.relative(baseDir, fullPath);
			files[relativePath] = fs.readFileSync(fullPath, 'utf-8');
		}
	}

	return files;
}

/**
 * Convert flat file paths to nested WebContainer directory structure
 *
 * Example:
 * Input:  { 'src/app.html': '<html>...</html>' }
 * Output: { src: { directory: { 'app.html': { file: { contents: '<html>...</html>' } } } } }
 *
 * @param files - Object with flat paths as keys (e.g., "src/app.html") and contents as values
 * @returns WebContainer-compatible nested FileSystemTree structure
 */
export function buildWebContainerFiles(files: Record<string, string>): FileSystemTree {
	const result: FileSystemTree = {};

	for (const [path, contents] of Object.entries(files)) {
		const parts = path.split('/');
		let current: any = result;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const isLastPart = i === parts.length - 1;

			if (isLastPart) {
				// It's a file
				current[part] = {
					file: {
						contents
					}
				};
			} else {
				// It's a directory
				if (!current[part]) {
					current[part] = {
						directory: {}
					};
				}
				current = current[part].directory;
			}
		}
	}

	return result;
}

export interface GenerateStackBlitzFilesOptions {
	templateDir: string;
	sourceDir: string;
	outputFile: string;
	remoteSourcesFile?: string;
	sources?: Record<string, string>;
	remoteSources?: Record<string, string>;
}

function readSource(sourceDir: string, sourcePath: string): string {
	return fs.readFileSync(path.join(sourceDir, sourcePath), 'utf-8');
}

export function generateStackBlitzFiles({
	templateDir,
	sourceDir,
	outputFile,
	remoteSourcesFile,
	sources = {},
	remoteSources = {}
}: GenerateStackBlitzFilesOptions) {
	const files = {
		...readAllFilesFromDirectory(templateDir),
		...Object.fromEntries(
			Object.entries(sources).map(([outputPath, sourcePath]) => [
				outputPath,
				readSource(sourceDir, sourcePath)
			])
		)
	};

	const remoteSourceFiles = Object.fromEntries(
		Object.entries(remoteSources).map(([outputPath, sourcePath]) => [
			outputPath,
			readSource(sourceDir, sourcePath)
		])
	);

	const outputDir = path.dirname(outputFile);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));
	console.log(`✅ StackBlitz files saved to ${outputFile}`);
	console.log(`   Total files: ${Object.keys(files).length}`);

	if (remoteSourcesFile) {
		fs.writeFileSync(remoteSourcesFile, JSON.stringify(remoteSourceFiles, null, 2));
		console.log(`\n✅ Remote source files saved to ${remoteSourcesFile}`);
		console.log(`   Total remote files: ${Object.keys(remoteSourceFiles).length}`);
	}

	console.log(`\nTemplate files read from: ${templateDir}`);
	return { files, remoteSourceFiles };
}
