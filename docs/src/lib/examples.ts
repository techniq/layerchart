/**
 * Example file loaders using dynamic imports
 *
 * Uses dynamic imports to load examples on-demand without pre-loading
 * all files via import.meta.glob (which causes Vite to pre-transform all matched files).
 */

import type { Component } from 'svelte';
import type { LoadedExample } from '$lib/types.js';

/**
 * Load a single example component and its source
 */
export async function loadExample(
	component: string,
	name: string,
	type: 'components' | 'utils' = 'components'
): Promise<LoadedExample | null> {
	try {
		// Use dynamic imports with template literals
		// Vite can still analyze these but won't pre-load all files
		const [componentModule, rawSource] = await Promise.all([
			import(`../examples/${type}/${component}/${name}.svelte`),
			import(`../examples/${type}/${component}/${name}.svelte?raw`)
		]);

		const { default: comp, ...module } = componentModule as {
			default: Component;
			layers?: string[];
		};
		const source = (rawSource.default as string).replace(/(\n\s*)*^.*export .*;.*$(\n\s*)*/gm, '\n');

		return { component: comp, source, module };
	} catch (e) {
		console.warn(`Failed to load example: ${type}/${component}/${name}`, e);
		return null;
	}
}

/**
 * Load multiple examples in parallel
 */
export async function loadExamples(
	items: Array<{ component: string; name: string }>,
	type: 'components' | 'utils' = 'components'
): Promise<Record<string, Record<string, LoadedExample>>> {
	const results: Record<string, Record<string, LoadedExample>> = {};

	await Promise.all(
		items.map(async ({ component, name }) => {
			const example = await loadExample(component, name, type);
			if (example) {
				if (!results[component]) {
					results[component] = {};
				}
				results[component][name] = example;
			}
		})
	);

	return results;
}

/**
 * Load an example by its path (relative to /src/routes or absolute from /src)
 * @param resolvedPath - The resolved path (e.g., "/src/routes/docs/guides/styles/color-schemes.svelte")
 */
export async function loadExampleByPath(resolvedPath: string): Promise<LoadedExample | null> {
	try {
		// Use import.meta.glob to load path-based examples
		// This is necessary because dynamic imports with fully dynamic paths don't work in Vite
		const modules = import.meta.glob<{ default: Component }>('/src/routes/**/*.svelte');
		const rawModules = import.meta.glob<{ default: string }>('/src/routes/**/*.svelte', {
			query: '?raw',
			import: 'default'
		});

		const componentModule = await modules[resolvedPath]?.();
		const rawSource = await rawModules[resolvedPath]?.();

		if (!componentModule || rawSource === undefined) {
			console.warn(`Failed to load example by path: ${resolvedPath}`);
			return null;
		}

		const comp = componentModule.default as Component;
		const source = (rawSource as string).replace(/(\n\s*)*^.*export .*;.*$(\n\s*)*/gm, '\n');

		return { component: comp, source };
	} catch (e) {
		console.warn(`Failed to load example by path: ${resolvedPath}`, e);
		return null;
	}
}
