/**
 * LayerChart Mini Docs Generator
 *
 * This script generates mini-docs component files for all components in the layerchart library.
 * It extracts API properties from the generated/api/*.json files.
 * It extracts metadata from the docs/src/content/*.md files.
 * It extracts 1st usage example from the docs/src/examples/components/*.svelte files.
 * It trims the code to remove module exports and data export statement.
 * It applies the appropriate indentation to the code to preserve the indentation of the code in mini-docs.
 * It generates the mini-docs content and saves it as a svelte file in docs/src/generated/mini-docs/*.svelte.
 * Once the components imported to the Layerchart components, you can hover over the component
 * in the IDE to see mini docs for each component.
 *
 * @description
 * Scans all .md files in docs/src/content and extracts:
 * - Component name
 * - Component URL
 * - Description
 * - Category
 * - Layers
 * - Related
 * - Usage example
 *
 *
 * @output
 * Generates individual ts files in generated/mini-docs/ for each component
 *
 * @usage
 * pnpm extract:mini-docs
 *
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toTitleCase } from '@layerstack/utils';
import type { ComponentAPI } from '../src/lib/api-types.js';

interface MiniDocsMetadata {
	componentName: string;
	componentUrl: string;
	description: string;
	category: string;
	layers: string[];
	related: string[];
	exampleName: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MARKDOWN_DIR = path.resolve(__dirname, '../src/content');
const API_DIR = path.resolve(__dirname, '../src/generated/api');
const EXAMPLES_DIR = path.resolve(__dirname, '../src/examples');
const CATEGORIES_DIR = path.resolve(__dirname, '../src/content/components');
const OUTPUT_DIR = path.resolve(__dirname, '../src/generated/mini-docs');

// Note: Identing of template is needed to preserve indentation of the code content.
// See https://www.youtube.com/watch?v=sY1Hqi5TENA&lc=UgyOIe4CX9hMxIywKEV4AaABAg
const miniDocsTemplate = `
<!--
	@component
	## <COMPONENT_NAME>

	<DESCRIPTION>

	<CATEGORY>

	<LAYERS>

	Full Documentation: [<COMPONENT_NAME>](<COMPONENT_URL>)

	<API>

	<RELATED>

	<EXAMPLE>
-->
`;

/**
 * Get all files with a specific extension in a directory (recursively), supporting files to ignore
 */
export function getFilesOfType(dir: string, ext: string, ignore: string[] = []): string[] {
	const files: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			// Recursively scan subdirectories
			files.push(...getFilesOfType(fullPath, ext, ignore));
		} else if (entry.isFile() && entry.name.endsWith(ext)) {
			// Check if file should be ignored
			const shouldIgnore = ignore.some((i) => fullPath.includes(i));
			if (!shouldIgnore) {
				files.push(fullPath);
			}
		}
	}

	return files;
}

/**
 * Extract component name, component URL, description, category, layers, related and usage example metadata from a markdown file
 */
function extractMiniDocsMetadata(filePath: string): MiniDocsMetadata {
	const content = fs.readFileSync(filePath, 'utf-8');

	const componentName = path.basename(filePath, '.md');
	const componentUrl = `/docs/components/${componentName}`;

	// Extract the description, categories, layers, and related metadatafrom the markdown file
	const descriptionMatch = content.match(/^description:\s*(.*?)\s*$/ms);
	const categoryMatch = content.match(/^category:\s*(.*?)\s*$/ms);
	const layersMatch = content.match(/^layers:\s*\[(.*?)\]\s*$/ms);
	const relatedMatch = content.match(/^related:\s*\[(.*?)\]\s*$/ms);
	const exampleNameMatch = content.match(/^:example\{\s*name=["|'](.*?)["'].*\}$/ms);

	const description = descriptionMatch?.[1]?.trim() || '';
	const category = toTitleCase(categoryMatch?.[1]?.trim() || '');
	const layers = layersMatch?.[1]?.split(',').map((l) => l.trim()) || [];
	const related = relatedMatch?.[1]?.split(',').map((r) => r.trim()) || [];
	const exampleName = exampleNameMatch?.[1]?.trim() || '';

	return { componentName, componentUrl, description, category, layers, related, exampleName };
}

/**
 * Trim code to remove module exports and data export statement
 * Note indentation included because it is required to preserve the indentation of the code in mini-docs
 */
function trimCode(code: string, indentLevel: number = 1): string {
	return code
		.replace(/<script\s+module>[\s\S]*?<\/script>/g, '') /* remove module exports section */
		.replace(
			/\n+\s*export \{ data \};\s*\n+\s*<\/script>/gm,
			'\n</script>'
		) /* remove data export statement */
		.replaceAll(
			/\n(?=.)/g,
			indentLevel > 0 ? '\n' + '\t'.repeat(indentLevel) : '\n'
		) /* apply indent only to lines with content (postiive lookahead)*/
		.trim();
}

/**
 * Get URL for component documentation page
 */
function getComponentUrl(component: string): string {
	return `/docs/components/${component}`;
}

/**
 * Main function
 */
function main() {
	console.warn(
		'WARNING: This script assumes API files have already been generated by the generate-component-api.ts script.'
	);
	console.log('\n\nExtracting component metadata from markdown files...');

	const mdFiles = getFilesOfType(MARKDOWN_DIR, '.md', ['async', 'promise', 'source-plugin']);
	console.log(`\nFound ${mdFiles.length} markdown files`);

	const mdMetadata: MiniDocsMetadata[] = [];

	for (const filePath of mdFiles) {
		const mdName = path.basename(filePath, '.md');
		console.log(`Processing ${mdName}...`);

		const metadata = extractMiniDocsMetadata(filePath);
		mdMetadata.push(metadata);
	}

	// Sort by component name
	mdMetadata.sort((a, b) => a.componentName.localeCompare(b.componentName));

	console.log('\nLoading corresponding component APIs from generated JSON files...');

	const apiFiles = getFilesOfType(API_DIR, '.json');
	console.log(`Found ${apiFiles.length} API files\n`);

	const apis: ComponentAPI[] = [];

	for (const filePath of apiFiles) {
		const componentName = path.basename(filePath, '.json');
		if (componentName === 'index') continue;
		console.log(`Loading API for ${componentName}...`);

		try {
			const apiContent = fs.readFileSync(filePath, 'utf-8');
			const api: ComponentAPI = JSON.parse(apiContent);
			apis.push(api);
			console.log(`  ✓ Loaded ${api.properties.length} properties`);
		} catch (error) {
			console.log(`  ⚠ Error loading API for ${componentName}:`, error);
		}
	}

	// Create output directory if it doesn't exist
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Write individual mini-docs files
	console.log(`\nWriting individual mini-docs files...`);

	for (const md of mdMetadata) {
		const miniDocsFile = path.join(OUTPUT_DIR, `${md.componentName}.svelte`);

		// Find matching API for the component
		const api = apis.find((a) => a.component === md.componentName);
		if (!api) {
			console.log(`  ⚠ No API found for ${md.componentName}`);
			continue;
		}

		// Get content of example file
		console.log(`  ⏳ Getting example content for example ${md.componentName}: ${md.exampleName}`);
		let exampleContent = '';
		if (md.exampleName) {
			const exampleFile = path.join(
				EXAMPLES_DIR,
				'components',
				md.componentName,
				`${md.exampleName}.svelte`
			);
			try {
				exampleContent = fs.readFileSync(exampleFile, 'utf-8');
			} catch (error) {
				console.log(`  ⚠ No example file found for ${md.componentName}: ${error}`);
			}
			exampleContent = trimCode(exampleContent);
		}

		// Generate mini-docs content
		const miniDocsContent = miniDocsTemplate
			.replaceAll('<COMPONENT_NAME>', md.componentName)
			.replaceAll('<COMPONENT_URL>', md.componentUrl)
			.replace('<DESCRIPTION>', md.description ? '## Description\n\n\t' + md.description : '')
			.replace(
				'<CATEGORY>',
				md.category
					? `## Category\n\n\t[[${md.category}](${CATEGORIES_DIR}/${md.category}.md)]`
					: ''
			)
			.replace(
				'<LAYERS>',
				md.layers
					.map((l, i) => {
						const h2 = i === 0 ? '## Layers\n\n\t' : '';
						return `${h2}[${l === 'html' || l === 'svg' ? l.toUpperCase() : toTitleCase(l)}](${getComponentUrl(l)})`;
					})
					.join(', ')
			)
			.replace(
				'<API>',
				api.properties
					.map((p, i) => {
						const h2 = i === 0 ? '## API Properties\n\n\t' : '';
						return `${h2}* ${p.name}:<${p.type}>${p.default ? `=${p.default}` : ''} - ${p.description} ${p.required ? ' (REQUIRED)' : ''}`;
					})
					.join('\n\t')
			)
			.replace(
				'<RELATED>',
				md.related
					.map((r, i) => {
						const h2 = i === 0 ? '## Related\n\n\t' : '';
						return `${h2}[${r}](${getComponentUrl(r)})`;
					})
					.join('\n\t')
			)
			.replace(
				'<EXAMPLE>',
				exampleContent ? '@example\n\t```svelte\n\t' + exampleContent + '\n\t```' : ''
			);

		fs.writeFileSync(miniDocsFile, miniDocsContent);
		console.log(`  ✓ Generated mini-docs for ${md.componentName}`);
	}

	// // Write index file with list of all mini-docs components
	// const indexFile = path.join(OUTPUT_DIR, 'index.json');
	// const indexOutput = {
	// 	generatedAt: new Date().toISOString(),
	// 	components: mdMetadata.map((md) => ({
	// 		component: md.componentName,
	// 		file: `${md.componentName}.svelte`
	// 	}))
	// };
	// fs.writeFileSync(indexFile, JSON.stringify(indexOutput, null, 2));

	console.log(`\n✅ Generated ${mdMetadata.length} component mini docs files in ${OUTPUT_DIR}`);
	// console.log(`✅ Generated index file: ${indexFile}`);
}

main();
