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
