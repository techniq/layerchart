import type { PageServerLoad } from './$types';
import { buildWebContainerFiles } from '@layerstack/docs/node/stackblitz';

// Import source files for the playground examples
import dataTs from '../../../lib/utils/data.ts?raw';

// Dynamically import all template files using Vite's import.meta.glob
const templateFiles = import.meta.glob('./template/**/*', {
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
		// Example: "./template/package.json" -> "package.json"
		const relativePath = path.replace('./template/', '');

		files[relativePath] = content as string;
	}

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
