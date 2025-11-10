/**
 * LayerChart StackBlitz Files Generator
 *
 * This script generates base files needed for StackBlitz projects that can run
 * any LayerChart example in an isolated environment.
 *
 * @description
 * Reads template files from scripts/stackblitz-template/ and generates:
 * - package.json with LayerChart and dependencies
 * - SvelteKit configuration files
 * - Basic layout and app.html
 * - Outputs to docs/static/stackblitz-files.json
 *
 * @usage
 * pnpm generate:stackblitz
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, 'stackblitz-template');
const SOURCE_DIR = path.resolve(__dirname, '../src');
const OUTPUT_FILE = path.resolve(__dirname, '../static/stackblitz-files.json');
const REMOTE_SOURCES_FILE = path.resolve(__dirname, '../static/remote-sources.json');

/**
 * Read a source file from the docs/src directory
 */
function readSource(sourcePath: string): string {
	const filePath = path.join(SOURCE_DIR, sourcePath);
	return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Recursively read all files from a directory and return them as a flat object
 * with relative paths as keys and file contents as values
 */
function readAllFilesFromDirectory(dir: string, baseDir: string = dir): Record<string, string> {
	const files: Record<string, string> = {};

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			// Recursively read subdirectories
			Object.assign(files, readAllFilesFromDirectory(fullPath, baseDir));
		} else if (entry.isFile()) {
			// Skip README.md as it's documentation for the templates directory
			if (entry.name === 'README.md') {
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
 * Generate the base files object by reading from template files
 */
function generateStackBlitzFiles() {
	return {
		// Read all template files from stackblitz-template directory
		...readAllFilesFromDirectory(TEMPLATES_DIR),
		// Add source files from docs/src
		'src/lib/utils/data.ts': readSource('lib/utils/data.ts')
	};
}

/**
 * Generate a JSON file containing the source code of remote modules
 * This is used by stackblitz.server.ts to parse function definitions
 */
function generateRemoteSourceFiles() {
	return {
		'data.remote.ts': readSource('lib/data.remote.ts'),
		'geo.remote.ts': readSource('lib/geo.remote.ts'),
		'graph.remote.ts': readSource('lib/graph.remote.ts')
	};
}

/**
 * Main function
 */
async function main() {
	console.log('LayerChart StackBlitz Files Generator');
	console.log('=====================================\n');

	const files = generateStackBlitzFiles();
	const remoteSources = generateRemoteSourceFiles();

	// Ensure output directory exists
	const outputDir = path.dirname(OUTPUT_FILE);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	// Write the files
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(files, null, 2));
	fs.writeFileSync(REMOTE_SOURCES_FILE, JSON.stringify(remoteSources, null, 2));

	console.log(`✅ StackBlitz files saved to ${OUTPUT_FILE}`);
	console.log(`   Total files: ${Object.keys(files).length}`);
	console.log(`\n✅ Remote source files saved to ${REMOTE_SOURCES_FILE}`);
	console.log(`   Total remote files: ${Object.keys(remoteSources).length}`);
	console.log(`\nTemplate files read from: ${TEMPLATES_DIR}`);
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
