import type { PageServerLoad } from './$types';
import { buildWebContainerFiles } from '../../../../scripts/stackblitz-utils.js';

// Import custom page template
import templatePageSvelte from './template/+page.svelte?raw';

// Import source files for the playground examples
import dataTs from '../../../lib/utils/data.ts?raw';

// Dynamically import all template files using Vite's import.meta.glob
const templateFiles = import.meta.glob('../../../../scripts/stackblitz-template/**/*', {
	query: '?raw',
	import: 'default',
	eager: true
});

// Build flat file structure using imported template files
function generatePlaygroundFiles(): Record<string, string> {
	const files: Record<string, string> = {};

	// Process all template files
	for (const [path, content] of Object.entries(templateFiles)) {
		// Extract relative path from the full import path
		// Example: "../../../../scripts/stackblitz-template/package.json" -> "package.json"
		const relativePath = path.replace('../../../../scripts/stackblitz-template/', '');

		// Skip README.md and .gitignore as they're not needed in the project
		if (relativePath === 'README.md' || relativePath === '.gitignore') {
			continue;
		}

		files[relativePath] = content as string;
	}

	// Override/add custom files for the playground
	files['src/routes/+page.svelte'] = templatePageSvelte;

	// Add utility data file
	files['src/lib/utils/data.ts'] = dataTs;

	return files;
}

// Convert to WebContainer nested structure
const templateProjectFiles = buildWebContainerFiles(generatePlaygroundFiles());

export const load: PageServerLoad = () => {
	return {
		templateProjectFiles
	};
};
