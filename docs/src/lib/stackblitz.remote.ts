import { query, getRequestEvent } from '$app/server';
import { z } from 'zod';
import stackblitzFiles from '$static/stackblitz-files.json';

// Import all example files at build time using Vite's import.meta.glob
// This works on Cloudflare Workers since files are bundled at build time
const exampleModules = import.meta.glob('/src/examples/**/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
});

// Import data.remote.ts source to parse function definitions
const dataRemoteSource = (await import('/src/lib/data.remote.ts?raw')).default as string;

// Parse data.remote.ts to extract function names, their fetch URLs, and type imports
function parseDataRemoteFunctions(source: string) {
	// Match pattern: export const functionName = prerender(async () => { ... fetch('url') ... parse<Type>(...) ... });
	const functionPattern = /export const (\w+) = prerender\(async \(\) => \{[\s\S]*?fetch\(['"]([^'"]+)['"]\)[\s\S]*?\}\);/g;
	const functionToDataMap = new Map<
		string,
		{ fetchUrl: string; functionBody: string }
	>();

	let match;
	while ((match = functionPattern.exec(source)) !== null) {
		const [fullMatch, functionName, fetchUrl] = match;
		functionToDataMap.set(functionName, {
			fetchUrl,
			functionBody: fullMatch
		});
	}

	return functionToDataMap;
}

// Parse type imports from data.remote.ts
function parseTypeImports(source: string) {
	// Match pattern: import type { TypeName } from '$static/data/examples/path/file.js';
	const typeImportPattern = /import type \{ ([^}]+) \} from ['"]\$static\/data\/examples\/([^'"]+)['"]/g;
	const typeToPathMap = new Map<string, string>();

	let match;
	while ((match = typeImportPattern.exec(source)) !== null) {
		const [, typeName, filePath] = match;
		typeToPathMap.set(typeName.trim(), filePath);
	}

	return typeToPathMap;
}

const dataFunctionMap = parseDataRemoteFunctions(dataRemoteSource);
const typeImportMap = parseTypeImports(dataRemoteSource);

// Extract type name from function body if it uses parse<Type>
function extractTypeFromFunctionBody(functionBody: string): string | null {
	const typeMatch = functionBody.match(/parse<(\w+)>/);
	return typeMatch ? typeMatch[1] : null;
}

// Generate the complete lib/data.remote.ts file content
function generateDataRemoteFileContent(
	functionBodies: string[],
	typeImports: Map<string, string>
): string {
	// Generate type import statements
	const typeImportStatements = Array.from(typeImports.entries())
		.map(([typeName, filePath]) => {
			// Convert .js extension to .d.ts for type files
			const typeFilePath = filePath.replace(/\.js$/, '.d.ts');
			return `import type { ${typeName} } from '$static/data/examples/${typeFilePath}';`;
		})
		.join('\n');

	return `import { parse } from '@layerstack/utils';
import { csvParse, autoType } from 'd3-dsv';

import { prerender, getRequestEvent } from '$app/server';

${typeImportStatements}

${functionBodies.join('\n\n')}
`;
}

export const getExample = query(
	z.object({
		component: z.string(),
		name: z.string()
	}),
	async ({ component, name }) => {
		// Construct the path to match import.meta.glob pattern
		const examplePath = `/src/examples/${component}/${name}.svelte`;

		// Get the source code from the pre-loaded modules
		const code = exampleModules[examplePath] as string | undefined;

		if (!code) {
			throw new Error('Example not found');
		}

		// Check if the example imports from data.remote
		const dataRemoteImports = code.match(
			/import\s+\{([^}]+)\}\s+from\s+['"]\$lib\/data\.remote['"]/
		);

		// Remove `export { data };` from the code
		const cleanCode = code.replace(/^.*export .*;.*$/gm, '');

		// Prepare additional files to include
		const additionalFiles: Record<string, string> = {};

		if (dataRemoteImports) {
			// Extract function names from the import statement
			const importedFunctions = dataRemoteImports[1]
				.split(',')
				.map((fn) => fn.trim())
				.filter((fn) => fn.length > 0);

			// Collect all data files and function bodies needed
			const dataFilesNeeded = new Set<string>();
			const functionBodies: string[] = [];
			const neededTypeImports = new Map<string, string>();

			for (const functionName of importedFunctions) {
				const functionData = dataFunctionMap.get(functionName);
				if (functionData) {
					dataFilesNeeded.add(functionData.fetchUrl);
					functionBodies.push(functionData.functionBody);

					// Extract type name from function body and find its import path
					const typeName = extractTypeFromFunctionBody(functionData.functionBody);
					if (typeName && typeImportMap.has(typeName)) {
						neededTypeImports.set(typeName, typeImportMap.get(typeName)!);
					}
				}
			}

			// Add lib/data.remote.ts with the necessary functions
			if (functionBodies.length > 0) {
				additionalFiles['src/lib/data.remote.ts'] = generateDataRemoteFileContent(
					functionBodies,
					neededTypeImports
				);
			}

			// Fetch all referenced data files from the running docs instance
			const { fetch: requestFetch } = getRequestEvent();
			for (const fetchUrl of dataFilesNeeded) {
				try {
					const content = await requestFetch(fetchUrl).then((r) => r.text());
					// Store with path relative to project root: static/data/examples/...
					const staticPath = `static${fetchUrl}`;
					additionalFiles[staticPath] = content;
				} catch (err) {
					console.warn(`Could not fetch data file: ${fetchUrl}`, err);
				}
			}

			// Fetch and include type definition files
			for (const [, typePath] of neededTypeImports) {
				try {
					const typeFilePath = `/data/examples/${typePath.replace(/\.js$/, '.d.ts')}`;
					const typeContent = await requestFetch(typeFilePath).then((r) => r.text());
					// Store with path: static/data/examples/...
					const staticTypePath = `static${typeFilePath}`;
					additionalFiles[staticTypePath] = typeContent;
				} catch (err) {
					console.warn(`Could not fetch type file for ${typePath}`, err);
				}
			}
		}

		return {
			code: cleanCode,
			files: { ...stackblitzFiles, ...additionalFiles } as Record<string, string>
		};
	}
);
