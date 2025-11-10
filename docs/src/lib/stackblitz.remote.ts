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

// Import all *.remote.ts source files to parse function definitions
const dataRemoteSource = (await import('/src/lib/data.remote.ts?raw')).default as string;
const geoRemoteSource = (await import('/src/lib/geo.remote.ts?raw')).default as string;
const graphRemoteSource = (await import('/src/lib/graph.remote.ts?raw')).default as string;

// Parse remote.ts files to extract function names, their fetch URLs, and function bodies
function parseRemoteFunctions(source: string) {
	// Match pattern: export const functionName = prerender(async () => { ... fetch('url') ... });
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

// Parse type imports from remote.ts files
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

// Parse regular imports (non-type imports) from remote.ts files
function parseRegularImports(source: string) {
	// Match pattern: import { something } from 'package';
	// Exclude type imports and from statements with $static or $lib
	const importPattern = /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?$/gm;
	const imports: string[] = [];

	let match;
	while ((match = importPattern.exec(source)) !== null) {
		const fullImport = match[0];
		// Skip type imports and local imports
		if (!fullImport.includes('import type') && !match[2].startsWith('$')) {
			imports.push(fullImport);
		}
	}

	return imports;
}

// Create maps for each remote file
const dataFunctionMap = parseRemoteFunctions(dataRemoteSource);
const dataTypeImportMap = parseTypeImports(dataRemoteSource);
const dataRegularImports = parseRegularImports(dataRemoteSource);

const geoFunctionMap = parseRemoteFunctions(geoRemoteSource);
const geoTypeImportMap = parseTypeImports(geoRemoteSource);
const geoRegularImports = parseRegularImports(geoRemoteSource);

const graphFunctionMap = parseRemoteFunctions(graphRemoteSource);
const graphTypeImportMap = parseTypeImports(graphRemoteSource);
const graphRegularImports = parseRegularImports(graphRemoteSource);

// Map of remote module name to its parsed data
const remoteModules = {
	data: {
		functionMap: dataFunctionMap,
		typeImportMap: dataTypeImportMap,
		regularImports: dataRegularImports
	},
	geo: {
		functionMap: geoFunctionMap,
		typeImportMap: geoTypeImportMap,
		regularImports: geoRegularImports
	},
	graph: {
		functionMap: graphFunctionMap,
		typeImportMap: graphTypeImportMap,
		regularImports: graphRegularImports
	}
} as const;

// Extract type name from function body if it uses parse<Type>
function extractTypeFromFunctionBody(functionBody: string): string | null {
	const typeMatch = functionBody.match(/parse<(\w+)>/);
	return typeMatch ? typeMatch[1] : null;
}

// Generate the complete lib/*.remote.ts file content
function generateRemoteFileContent(
	functionBodies: string[],
	typeImports: Map<string, string>,
	regularImports: string[]
): string {
	// Generate type import statements
	const typeImportStatements = Array.from(typeImports.entries())
		.map(([typeName, filePath]) => {
			// Convert .js extension to .d.ts for type files
			const typeFilePath = filePath.replace(/\.js$/, '.d.ts');
			return `import type { ${typeName} } from '$static/data/examples/${typeFilePath}';`;
		})
		.join('\n');

	// Combine regular imports, removing duplicates
	const uniqueRegularImports = [...new Set(regularImports)];

	return `${uniqueRegularImports.join('\n')}

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

		// Remove `export { data };` from the code
		const cleanCode = code.replace(/^.*export .*;.*$/gm, '');

		// Prepare additional files to include
		const additionalFiles: Record<string, string> = {};

		// Get request fetch once
		const { fetch: requestFetch } = getRequestEvent();

		// Process each remote module type (data, geo, graph)
		for (const [moduleName, moduleData] of Object.entries(remoteModules)) {
			// Check if the example imports from this remote module
			const remoteImportPattern = new RegExp(
				`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]\\$lib\\/${moduleName}\\.remote['"]`
			);
			const remoteImports = code.match(remoteImportPattern);

			if (remoteImports) {
				// Extract function names from the import statement
				const importedFunctions = remoteImports[1]
					.split(',')
					.map((fn) => fn.trim())
					.filter((fn) => fn.length > 0);

				// Collect all data files and function bodies needed
				const dataFilesNeeded = new Set<string>();
				const functionBodies: string[] = [];
				const neededTypeImports = new Map<string, string>();
				const neededRegularImports = new Set<string>();

				for (const functionName of importedFunctions) {
					const functionData = moduleData.functionMap.get(functionName);
					if (functionData) {
						dataFilesNeeded.add(functionData.fetchUrl);
						functionBodies.push(functionData.functionBody);

						// Extract type name from function body and find its import path
						const typeName = extractTypeFromFunctionBody(functionData.functionBody);
						if (typeName && moduleData.typeImportMap.has(typeName)) {
							neededTypeImports.set(typeName, moduleData.typeImportMap.get(typeName)!);
						}
					}
				}

				// Add all regular imports from this module
				moduleData.regularImports.forEach((imp) => neededRegularImports.add(imp));

				// Add lib/*.remote.ts with the necessary functions
				if (functionBodies.length > 0) {
					additionalFiles[`src/lib/${moduleName}.remote.ts`] = generateRemoteFileContent(
						functionBodies,
						neededTypeImports,
						Array.from(neededRegularImports)
					);
				}

				// Fetch all referenced data files from the running docs instance
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
		}

		return {
			code: cleanCode,
			files: { ...stackblitzFiles, ...additionalFiles } as Record<string, string>
		};
	}
);
