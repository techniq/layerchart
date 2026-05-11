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
import type {
	ComponentCatalog,
	ComponentUsageInExample,
	ExampleInfo,
	UsageInfo
} from '../catalog.js';

let COMPONENTS_DIR = '';
let EXAMPLES_DIR = '';

/**
 * Get all canonical component files from the components directory (recursively).
 *
 * Skips per-layer variants (`*.svg.svelte`, `*.canvas.svelte`, `*.html.svelte`)
 * and the shared base impl (`*.base.svelte`) — only the canonical
 * `<Name>.svelte` is treated as a public component.
 */
function getComponents(dir: string): string[] {
	const components: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isFile() && entry.name.endsWith('.svelte')) {
			if (/\.(svg|canvas|html|base)\.svelte$/.test(entry.name)) continue;
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
 * Extract all component usages from an example file
 */
function extractComponentsFromExample(
	filePath: string,
	allComponents: string[]
): ComponentUsageInExample[] {
	const components: ComponentUsageInExample[] = [];
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	// Track which components we've found to avoid duplicates
	const foundComponents = new Set<string>();

	// Search for each known component in the file
	for (const componentName of allComponents) {
		// Use word boundary to avoid matching components with similar prefixes
		// Match if followed by: whitespace, >, /, ., :, or end-of-line
		const searchPattern = new RegExp(`<${componentName}(?:\\s|>|/|\\.|:|$)`, 'i');

		lines.forEach((line, index) => {
			if (searchPattern.test(line) && !foundComponents.has(componentName)) {
				foundComponents.add(componentName);
				components.push({
					component: componentName,
					lineNumber: index + 1,
					line: line.trim()
				});
			}
		});
	}

	// Sort by line number
	return components.sort((a, b) => a.lineNumber - b.lineNumber);
}

/**
 * Extract module-level exports (title, description, tags) from a <script module> block
 */
function extractModuleExports(filePath: string): {
	title?: string;
	description?: string;
	tags?: string[];
} {
	const content = fs.readFileSync(filePath, 'utf-8');
	const moduleMatch = content.match(/<script\s+module[^>]*>([\s\S]*?)<\/script>/);
	if (!moduleMatch) return {};

	const moduleContent = moduleMatch[1];
	const result: { title?: string; description?: string; tags?: string[] } = {};

	const titleMatch = moduleContent.match(/export\s+(?:let|const)\s+title\s*=\s*['"`](.+?)['"`]/);
	if (titleMatch) result.title = titleMatch[1];

	const descMatch = moduleContent.match(
		/export\s+(?:let|const)\s+description\s*=\s*['"`](.+?)['"`]/
	);
	if (descMatch) result.description = descMatch[1];

	const tagsMatch = moduleContent.match(/export\s+(?:let|const)\s+tags\s*=\s*\[([\s\S]*?)\]/);
	if (tagsMatch) {
		const items = tagsMatch[1].match(/['"`]([^'"`]+)['"`]/g);
		if (items?.length) {
			result.tags = items.map((s) => s.slice(1, -1));
		}
	}

	return result;
}

/**
 * Get all examples for a specific component
 */
function getComponentExamples(componentName: string, allComponents: string[]): ExampleInfo[] {
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
			const filePath = path.join(componentExamplesDir, entry.name);

			// Extract all components used in this example
			const componentsInExample = extractComponentsFromExample(filePath, allComponents);

			// Extract module-level exports
			const moduleExports = extractModuleExports(filePath);

			const info: ExampleInfo = {
				name: exampleName,
				title: moduleExports.title ?? exampleName.replaceAll('-', ' '),
				path: `/docs/components/${componentName}/${exampleName}`,
				components: componentsInExample
			};

			if (moduleExports.description) {
				info.description = moduleExports.description;
			}

			if (moduleExports.tags?.length) {
				info.tags = moduleExports.tags;
			}

			examples.push(info);
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
								path: `/docs/components/${entry.name}/${exampleName}`,
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
export function generateComponentCatalog(
	componentName: string,
	catalogPath: string,
	allComponents: string[]
): ComponentCatalog {
	console.log(`Processing ${componentName}...`);

	const examples = getComponentExamples(componentName, allComponents);
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

export interface GenerateExampleCatalogOptions {
	componentsDir: string;
	examplesDir: string;
	catalogDir: string;
	title?: string;
	logger?: Pick<Console, 'log'>;
}

export async function writeExampleCatalogs({
	componentsDir,
	examplesDir,
	catalogDir,
	title = 'Example Catalog Generator',
	logger = console
}: GenerateExampleCatalogOptions) {
	COMPONENTS_DIR = componentsDir;
	EXAMPLES_DIR = examplesDir;

	logger.log(title);
	logger.log('===================================\n');

	// Ensure catalog directory exists
	ensureDir(catalogDir);

	// Get all components
	const components = getComponents(componentsDir);
	logger.log(`Found ${components.length} components\n`);

	let processedCount = 0;
	let totalExamples = 0;
	let totalUsages = 0;

	// Process each component
	for (const componentName of components) {
		// Write catalog file
		const catalogPath = path.join(catalogDir, `${componentName}.json`);
		const catalog = generateComponentCatalog(componentName, catalogPath, components);

		fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

		logger.log(`  ✓ Examples: ${catalog.examples.length}`);
		logger.log(`  ✓ Usages: ${catalog.usage.length}`);
		logger.log(`  ✓ Saved to ${catalogPath}\n`);

		processedCount++;
		totalExamples += catalog.examples.length;
		totalUsages += catalog.usage.length;
	}

	// Print summary
	logger.log('===================================');
	logger.log('Summary:');
	logger.log(`  Components processed: ${processedCount}`);
	logger.log(`  Total examples: ${totalExamples}`);
	logger.log(`  Total usages: ${totalUsages}`);
	logger.log(`\n✅ Catalog files saved to ${catalogDir}`);
	return { processedCount, totalExamples, totalUsages };
}
