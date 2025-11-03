/**
 * LayerChart Example Index Generator
 *
 * This script generates a catalog for each component that shows:
 * - All examples available for that component
 * - All usage of that component across all examples
 *
 * @description
 * Scans all components in packages/layerchart/src/lib/components and for each:
 * - Finds examples in docs/src/examples/[ComponentName]/
 * - Searches all examples for usage of <ComponentName
 * - Generates docs/src/examples/catalog/[ComponentName].json
 *
 * @usage
 * pnpm generate:catalog
 *
 * @example
 * // Generates catalog files like:
 * // docs/src/examples/catalog/Rect.json
 * // docs/src/examples/catalog/Area.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
	ComponentCatalog,
	ExampleInfo,
	UsageInfo
} from '../src/examples/catalog/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.resolve(__dirname, '../../packages/layerchart/src/lib/components');
const EXAMPLES_DIR = path.resolve(__dirname, '../src/examples');
const CATALOG_DIR = path.resolve(__dirname, '../src/examples/catalog');

/**
 * Get all component files from the components directory (recursively)
 */
function getComponents(dir: string): string[] {
	const components: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isFile() && entry.name.endsWith('.svelte')) {
			// Remove .svelte extension to get component name
			const componentName = entry.name.replace('.svelte', '');
			components.push(componentName);
		} else if (entry.isDirectory()) {
			// Recursively scan subdirectories
			components.push(...getComponents(fullPath));
		}
	}

	return components.sort();
}

/**
 * Get all examples for a specific component
 */
function getComponentExamples(componentName: string): ExampleInfo[] {
	const componentExamplesDir = path.join(EXAMPLES_DIR, componentName);
	const examples: ExampleInfo[] = [];

	// Check if the component examples directory exists
	if (!fs.existsSync(componentExamplesDir)) {
		return examples;
	}

	const entries = fs.readdirSync(componentExamplesDir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isFile() && entry.name.endsWith('.svelte')) {
			// Remove .svelte extension
			const exampleName = entry.name.replace('.svelte', '');
			examples.push({
				name: exampleName,
				path: `/example/${componentName}/${exampleName}`
			});
		}
	}

	return examples.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Search all examples for usage of a component
 */
function findComponentUsage(componentName: string): UsageInfo[] {
	const usage: UsageInfo[] = [];
	const entries = fs.readdirSync(EXAMPLES_DIR, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			const exampleComponentDir = path.join(EXAMPLES_DIR, entry.name);
			const exampleFiles = fs.readdirSync(exampleComponentDir, { withFileTypes: true });

			for (const exampleFile of exampleFiles) {
				if (exampleFile.isFile() && exampleFile.name.endsWith('.svelte')) {
					const filePath = path.join(exampleComponentDir, exampleFile.name);
					const content = fs.readFileSync(filePath, 'utf-8');
					const lines = content.split('\n');

					// Search for <ComponentName usage
					// Use word boundary to avoid matching components with similar prefixes
					// e.g., searching for "AnnotationLine" shouldn't match "AnnotationLineControls"
					// Match if followed by: whitespace, >, /, ., :, or end-of-line
					const searchPattern = new RegExp(`<${componentName}(?:\\s|>|/|\\.|:|$)`, 'i');

					lines.forEach((line, index) => {
						// Create new regex each time to avoid stateful issues with global flag
						if (searchPattern.test(line)) {
							const exampleName = exampleFile.name.replace('.svelte', '');
							usage.push({
								example: exampleName,
								component: entry.name,
								path: `/example/${entry.name}/${exampleName}`,
								lineNumber: index + 1,
								line: line.trim()
							});
						}
					});
				}
			}
		}
	}

	return usage.sort((a, b) => {
		const pathCompare = a.path.localeCompare(b.path);
		return pathCompare !== 0 ? pathCompare : a.lineNumber - b.lineNumber;
	});
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

/**
 * Generate catalog for a single component
 */
function generateComponentCatalog(componentName: string, catalogPath: string): ComponentCatalog {
	console.log(`Processing ${componentName}...`);

	const examples = getComponentExamples(componentName);
	const usage = findComponentUsage(componentName);

	// Check if catalog file exists and read it
	let existingUpdatedAt: string | undefined;
	if (fs.existsSync(catalogPath)) {
		try {
			const existingContent = fs.readFileSync(catalogPath, 'utf-8');
			const existingCatalog: ComponentCatalog = JSON.parse(existingContent);

			// Check if content has changed (excluding updatedAt field)
			const contentUnchanged =
				existingCatalog.component === componentName &&
				JSON.stringify(existingCatalog.examples) === JSON.stringify(examples) &&
				JSON.stringify(existingCatalog.usage) === JSON.stringify(usage);

			if (contentUnchanged) {
				existingUpdatedAt = existingCatalog.updatedAt;
			}
		} catch (error) {
			// If we can't read or parse, treat as new file
		}
	}

	return {
		component: componentName,
		examples,
		usage,
		updatedAt: existingUpdatedAt ?? new Date().toISOString()
	};
}

/**
 * Main function
 */
async function main() {
	console.log('LayerChart Example Index Generator');
	console.log('===================================\n');

	// Ensure catalog directory exists
	ensureDir(CATALOG_DIR);

	// Get all components
	const components = getComponents(COMPONENTS_DIR);
	console.log(`Found ${components.length} components\n`);

	let processedCount = 0;
	let totalExamples = 0;
	let totalUsages = 0;

	// Process each component
	for (const componentName of components) {
		// Write catalog file
		const catalogPath = path.join(CATALOG_DIR, `${componentName}.json`);
		const catalog = generateComponentCatalog(componentName, catalogPath);

		fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

		console.log(`  ✓ Examples: ${catalog.examples.length}`);
		console.log(`  ✓ Usages: ${catalog.usage.length}`);
		console.log(`  ✓ Saved to ${catalogPath}\n`);

		processedCount++;
		totalExamples += catalog.examples.length;
		totalUsages += catalog.usage.length;
	}

	// Print summary
	console.log('===================================');
	console.log('Summary:');
	console.log(`  Components processed: ${processedCount}`);
	console.log(`  Total examples: ${totalExamples}`);
	console.log(`  Total usages: ${totalUsages}`);
	console.log(`\n✅ Catalog files saved to ${CATALOG_DIR}`);
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
