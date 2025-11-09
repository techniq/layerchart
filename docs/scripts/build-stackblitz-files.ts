/**
 * LayerChart StackBlitz Files Generator
 *
 * This script generates base files needed for StackBlitz projects that can run
 * any LayerChart example in an isolated environment.
 *
 * @description
 * Reads template files from scripts/stackblitz-templates/ and generates:
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

const TEMPLATES_DIR = path.resolve(__dirname, 'stackblitz-templates');
const OUTPUT_FILE = path.resolve(__dirname, '../static/stackblitz-files.json');

/**
 * Read a template file from the templates directory
 */
function readTemplate(filename: string): string {
	const filePath = path.join(TEMPLATES_DIR, filename);
	return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Generate the base files object by reading from template files
 */
function generateStackBlitzFiles() {
	return {
		'package.json': readTemplate('package.json'),
		'svelte.config.js': readTemplate('svelte.config.js'),
		'vite.config.js': readTemplate('vite.config.js'),
		'src/app.html': readTemplate('app.html'),
		'src/app.css': readTemplate('app.css'),
		'src/routes/+layout.svelte': readTemplate('+layout.svelte'),
		'.gitignore': readTemplate('.gitignore')
	};
}

/**
 * Main function
 */
async function main() {
	console.log('LayerChart StackBlitz Files Generator');
	console.log('=====================================\n');

	const files = generateStackBlitzFiles();

	// Ensure output directory exists
	const outputDir = path.dirname(OUTPUT_FILE);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	// Write the files
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(files, null, 2));

	console.log(`✅ StackBlitz files saved to ${OUTPUT_FILE}`);
	console.log(`   Total files: ${Object.keys(files).length}`);
	console.log(`\nTemplate files read from: ${TEMPLATES_DIR}`);
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
