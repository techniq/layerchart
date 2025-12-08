import type { PageServerLoad } from './$types';
import {
	readAllFilesFromDirectory,
	buildWebContainerFiles
} from '../../../../scripts/stackblitz-utils.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Import custom page template
import templatePageSvelte from './template/+page.svelte?raw';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, '../../../../scripts/stackblitz-template');

// Read source files for the playground examples
function readSource(sourcePath: string): string {
	const SOURCE_DIR = path.resolve(__dirname, '../../../');
	const filePath = path.join(SOURCE_DIR, sourcePath);
	return fs.readFileSync(filePath, 'utf-8');
}

// Build flat file structure by reading from stackblitz-template directory
function generatePlaygroundFiles(): Record<string, string> {
	return {
		// Read all template files from stackblitz-template directory
		...readAllFilesFromDirectory(TEMPLATES_DIR),
		// Override/add custom files for the playground
		'src/routes/+page.svelte': templatePageSvelte,
		// Add utility data file
		'src/lib/utils/data.ts': readSource('lib/utils/data.ts')
	};
}

// Convert to WebContainer nested structure
const templateProjectFiles = buildWebContainerFiles(generatePlaygroundFiles());

export const load: PageServerLoad = () => {
	return {
		templateProjectFiles
	};
};
