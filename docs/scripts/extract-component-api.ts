/**
 * LayerChart Component API Extractor
 *
 * This script extracts TypeScript type definitions and JSDoc documentation from
 * Svelte components in the layerchart library.
 *
 * @description
 * Scans all .svelte files in packages/layerchart/src/lib/components and extracts:
 * - Component prop types (*PropsWithoutHTML pattern)
 * - JSDoc descriptions for each property
 * - Default values from @default tags
 * - Optional/required status
 * - Additional JSDoc tags (@bindable, etc.)
 *
 * @output
 * Generates api.json containing structured API documentation for all components
 *
 * @usage
 * pnpm extract:api
 *
 * @example
 * // Generated output structure:
 * {
 *   "generatedAt": "2025-11-02T00:00:00.000Z",
 *   "components": [
 *     {
 *       "component": "Rect",
 *       "propsType": "RectPropsWithoutHTML",
 *       "properties": [
 *         {
 *           "name": "x",
 *           "type": "number",
 *           "optional": true,
 *           "description": "The x-coordinate",
 *           "default": "0"
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';
import type { PropertyInfo, ComponentAPI } from '../src/lib/api-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.resolve(__dirname, '../../packages/layerchart/src/lib/components');
const OUTPUT_DIR = path.resolve(__dirname, '../src/generated/api');
const OUTPUT_FILE = path.resolve(__dirname, '../src/generated/api.json');

/**
 * Get all .svelte files in a directory
 */
export function getSvelteFiles(dir: string): string[] {
	const files: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			// Skip subdirectories for now (charts, layers, tooltip)
			continue;
		} else if (entry.isFile() && entry.name.endsWith('.svelte')) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Extract JSDoc comments from a node
 */
function extractJsDoc(node: ts.Node): {
	description?: string;
	tags?: Record<string, string>;
	default?: string;
} {
	const jsDocTags = ts.getJSDocTags(node);
	const jsDocComments = (node as any).jsDoc;

	let description: string | undefined;
	const tags: Record<string, string> = {};
	let defaultValue: string | undefined;

	// Extract description from JSDoc comment
	if (jsDocComments && jsDocComments.length > 0) {
		const comment = jsDocComments[0].comment;
		if (typeof comment === 'string') {
			description = comment;
		} else if (Array.isArray(comment)) {
			description = comment.map((c) => c.text).join('');
		}
	}

	// Extract tags
	for (const tag of jsDocTags) {
		const tagName = tag.tagName.text;
		let tagValue = '';

		if (tag.comment) {
			if (typeof tag.comment === 'string') {
				tagValue = tag.comment;
			} else if (Array.isArray(tag.comment)) {
				tagValue = tag.comment.map((c) => c.text).join('');
			}
		}

		if (tagName === 'default') {
			defaultValue = tagValue;
		} else {
			tags[tagName] = tagValue;
		}
	}

	return {
		description,
		tags: Object.keys(tags).length > 0 ? tags : undefined,
		default: defaultValue
	};
}

/**
 * Get type as string
 */
function getTypeString(typeNode: ts.TypeNode | undefined, checker: ts.TypeChecker): string {
	if (!typeNode) return 'any';

	// Use the printer to get a string representation
	const printer = ts.createPrinter({ removeComments: true });
	const typeString = printer.printNode(ts.EmitHint.Unspecified, typeNode, typeNode.getSourceFile());

	// Normalize whitespace - collapse multiple spaces/newlines into single spaces
	return typeString.replace(/\s+/g, ' ').trim();
}

/**
 * Extract properties from a type literal or interface
 */
function extractProperties(
	node: ts.TypeLiteralNode | ts.InterfaceDeclaration,
	checker: ts.TypeChecker
): PropertyInfo[] {
	const properties: PropertyInfo[] = [];

	for (const member of node.members) {
		if (ts.isPropertySignature(member) && member.name) {
			const name = member.name.getText();
			const required = !member.questionToken; // Inverted: required = not optional
			const type = getTypeString(member.type, checker);
			const jsDoc = extractJsDoc(member);

			// Check if this is a nested object type
			let nestedProperties: PropertyInfo[] | undefined;
			if (member.type && ts.isTypeLiteralNode(member.type)) {
				nestedProperties = extractProperties(member.type, checker);
			}

			properties.push({
				name,
				type,
				required,
				...jsDoc,
				...(nestedProperties && nestedProperties.length > 0 ? { properties: nestedProperties } : {})
			});
		}
	}

	return properties;
}

/**
 * Resolve intersection types and extract all properties
 */
function extractPropertiesFromType(
	typeNode: ts.TypeNode,
	checker: ts.TypeChecker,
	sourceFile: ts.SourceFile
): PropertyInfo[] {
	let properties: PropertyInfo[] = [];

	if (ts.isIntersectionTypeNode(typeNode)) {
		// Handle intersection types (A & B & C)
		for (const type of typeNode.types) {
			properties = properties.concat(extractPropertiesFromType(type, checker, sourceFile));
		}
	} else if (ts.isTypeLiteralNode(typeNode)) {
		// Handle inline type literals
		properties = extractProperties(typeNode, checker);
	} else if (ts.isTypeReferenceNode(typeNode)) {
		// Handle type references (e.g., CommonStyleProps)
		const typeName = typeNode.typeName.getText();

		// Try to find the type definition in the same file
		ts.forEachChild(sourceFile, (node) => {
			if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
				properties = properties.concat(extractPropertiesFromType(node.type, checker, sourceFile));
			} else if (ts.isInterfaceDeclaration(node) && node.name.text === typeName) {
				properties = properties.concat(extractProperties(node, checker));
			}
		});
	}

	return properties;
}

/**
 * Extract component API from a Svelte file
 */
export function extractComponentAPI(filePath: string): ComponentAPI | null {
	const content = fs.readFileSync(filePath, 'utf-8');

	// Extract the module script content
	const moduleScriptMatch = content.match(
		/<script[^>]*lang="ts"[^>]*module[^>]*>([\s\S]*?)<\/script>/
	);
	if (!moduleScriptMatch) {
		return null;
	}

	const moduleScript = moduleScriptMatch[1];

	// Look for the main Props type (e.g., RectPropsWithoutHTML, CirclePropsWithoutHTML)
	const componentName = path.basename(filePath, '.svelte');
	const propsTypeName = `${componentName}PropsWithoutHTML`;

	// Check if this type exists in the file
	if (!moduleScript.includes(`export type ${propsTypeName}`)) {
		return null;
	}

	// Create a temporary TypeScript file for parsing
	const tempFile = `temp-${componentName}.ts`;
	const tempPath = path.join(path.dirname(filePath), tempFile);

	// Write the module script to a temp file with necessary imports resolved
	// We keep the original imports but add stub types for common ones that might not resolve
	const tempContent = `
import type { SVGAttributes } from 'svelte/elements';
import type { Snippet, Component } from 'svelte';

// Stub types that might not resolve (only if not already defined)
type CommonStyleProps = {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  opacity?: number;
};
type CommonEvents = Record<string, any>;
type Without<T, U> = Omit<T, keyof U>;
type MotionProp<T = any> = any;
type SingleDomainType = any;
type Placement = 'top' | 'right' | 'bottom' | 'left';

${moduleScript}
`;

	fs.writeFileSync(tempPath, tempContent);

	try {
		// Parse the TypeScript file
		const program = ts.createProgram([tempPath], {
			target: ts.ScriptTarget.ES2020,
			module: ts.ModuleKind.ESNext
		});

		const sourceFile = program.getSourceFile(tempPath);
		if (!sourceFile) {
			return null;
		}

		const checker = program.getTypeChecker();
		let properties: PropertyInfo[] = [];

		// Find the PropsWithoutHTML type
		ts.forEachChild(sourceFile, (node) => {
			if (ts.isTypeAliasDeclaration(node) && node.name.text === propsTypeName) {
				properties = extractPropertiesFromType(node.type, checker, sourceFile);
			}
		});

		if (properties.length === 0) {
			return null;
		}

		return {
			generatedAt: new Date().toISOString(),
			component: componentName,
			propsType: propsTypeName,
			properties
		};
	} finally {
		// Clean up temp file
		if (fs.existsSync(tempPath)) {
			fs.unlinkSync(tempPath);
		}
	}
}

/**
 * Extract APIs for all components in a directory
 */
export function extractAPIs(dir: string): ComponentAPI[] {
	const svelteFiles = getSvelteFiles(dir);
	const apis: ComponentAPI[] = [];

	for (const filePath of svelteFiles) {
		const api = extractComponentAPI(filePath);
		if (api) {
			apis.push(api);
		}
	}

	return apis.sort((a, b) => a.component.localeCompare(b.component));
}

/**
 * Main function
 */
function main() {
	console.log('Extracting component APIs...');

	const svelteFiles = getSvelteFiles(COMPONENTS_DIR);
	console.log(`Found ${svelteFiles.length} Svelte files`);

	const apis: ComponentAPI[] = [];

	for (const filePath of svelteFiles) {
		const componentName = path.basename(filePath, '.svelte');
		console.log(`Processing ${componentName}...`);

		const api = extractComponentAPI(filePath);
		if (api) {
			apis.push(api);
			console.log(`  ✓ Extracted ${api.properties.length} properties`);
		} else {
			console.log(`  ⚠ No PropsWithoutHTML type found`);
		}
	}

	// Sort by component name
	apis.sort((a, b) => a.component.localeCompare(b.component));

	// Create output directory if it doesn't exist
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Write individual component files
	console.log(`\nWriting individual component files...`);
	for (const api of apis) {
		const componentFile = path.join(OUTPUT_DIR, `${api.component}.json`);
		fs.writeFileSync(componentFile, JSON.stringify(api, null, 2));
	}

	// Write index file with list of all components
	const indexFile = path.join(OUTPUT_DIR, 'index.json');
	const indexOutput = {
		generatedAt: new Date().toISOString(),
		components: apis.map((api) => ({
			component: api.component,
			propsType: api.propsType,
			propertyCount: api.properties.length,
			file: `${api.component}.json`
		}))
	};
	fs.writeFileSync(indexFile, JSON.stringify(indexOutput, null, 2));

	// Write combined output file
	const output = {
		generatedAt: new Date().toISOString(),
		components: apis
	};

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

	console.log(`\n✅ Generated ${apis.length} component API files in ${OUTPUT_DIR}`);
	console.log(`✅ Generated index file: ${indexFile}`);
	console.log(`✅ Generated combined file: ${OUTPUT_FILE}`);
	console.log(`   Extracted ${apis.length} component APIs`);
}

main();
