import type { Component } from 'svelte';
import { error } from '@sveltejs/kit';

import {
	allComponents,
	type Component as ComponentMetadata,
	allExamples,
	type Example as ExampleMetadata,
	allUtils,
	type Util as UtilMetadata
} from 'content-collections';

import type { Examples } from '$lib/types.js';
import type { ComponentCatalog } from '$examples/catalog/types.js';

/**
 * Resolve a relative or absolute path to a full Svelte component path
 */
export function resolveExamplePath(path: string, currentPath: string): string {
	if (path.startsWith('./')) {
		return `/src/routes${currentPath}/${path.slice(2)}`;
	} else if (path.startsWith('/')) {
		return `/src${path}`;
	} else {
		return `/src/routes${currentPath}/${path}`;
	}
}

/**
 * Get markdown document component and metadata (frontmatter)
 * @param slug
 * @param type - The type of content ('components' or 'utils')
 * @returns
 */
export async function getMarkdownComponent(
	slug: string = 'index',
	type: 'components' | 'utils' = 'components'
) {
	const modules = import.meta.glob<{
		default: Component;
		metadata: ComponentMetadata | ExampleMetadata | UtilMetadata;
	}>('/src/content/**/*.md');

	let doc: Awaited<ReturnType<(typeof modules)[string]>> | null = null;
	for (const [path, resolver] of Object.entries(modules)) {
		if (path === `/src/content/${type}/${slug}.md`) {
			doc = await resolver();
			break;
		}
	}

	const metadata = getMetadata(slug, type);

	if (!doc || !metadata) {
		error(404, 'Could not find the document.');
	}

	return {
		PageComponent: doc.default,
		metadata
	};
}

/**
 * Get full metadata (authored frontmatter + content-collection transformed)
 */
function getMetadata(
	slug: string,
	type: 'components' | 'utils' = 'components'
): ComponentMetadata | UtilMetadata {
	if (type === 'utils') {
		return allUtils.find((u) => u.slug === slug) as any;
	}
	return allComponents.find((c) => c.slug === slug) as any;
}

/**
 * Extract examples from markdown content and load their components
 * @param markdownContent - The markdown content to extract examples from
 * @param catalog - Optional catalog to include examples from
 * @param allExamples - Glob import of all example components
 * @param allSources - Glob import of all example sources
 * @param defaultComponent - Optional default component name (from route params)
 * @param type - The type of content ('components' or 'utils')
 * @param currentPath - Optional current path for resolving relative paths
 * @returns Examples object with loaded components and sources
 */
export async function loadExamplesFromMarkdown(
	markdownContent: string,
	catalog: ComponentCatalog | null,
	allExamples: Record<string, () => Promise<any>>,
	allSources: Record<string, () => Promise<any>>,
	defaultComponent?: string,
	type: 'components' | 'utils' = 'components',
	currentPath?: string
): Promise<Examples> {
	// Extract all <Example component="..." name="..."> and <Example path="..."> from markdown content
	const regex = /<Example\s+([^>]*?)\/>/g;
	const matches = [...markdownContent.matchAll(regex)];
	const pageExamples = matches.map((match) => {
		const attrs = match[1];
		const component = attrs.match(/component="([^"]*?)"/)?.[1] || defaultComponent; // use default component if not explicit (ex. <Example name="basic" />)
		const name = attrs.match(/name="([^"]*?)"/)?.[1] || null;
		const path = attrs.match(/path="([^"]*?)"/)?.[1] || null;
		return { component, name, path };
	});

	// Load all Svelte files from /src for path-based examples
	const allSvelteComponents = import.meta.glob('/src/**/*.svelte');
	const allSvelteSources = import.meta.glob('/src/**/*.svelte', {
		query: '?raw',
		import: 'default'
	});

	const examples: Examples = {};

	// Handle path-based examples
	for (const example of pageExamples) {
		if (example.path && currentPath) {
			const resolvedPath = resolveExamplePath(example.path, currentPath);

			// Load component and source
			if (allSvelteComponents[resolvedPath] && allSvelteSources[resolvedPath]) {
				try {
					const component = (await allSvelteComponents[resolvedPath]()) as any;
					const source = (await allSvelteSources[resolvedPath]()) as string;

					// Store path-based examples under '__path__' namespace
					if (!examples['__path__']) {
						examples['__path__'] = {};
					}
					examples['__path__'][resolvedPath] = {
						component: component.default,
						source
					};
				} catch (e) {
					console.error(`Failed to load path-based example: ${resolvedPath}`, e);
				}
			}
		}
	}

	// Handle traditional component/name-based examples
	for (const path in allExamples) {
		// Check if this path matches catalog examples
		const catalogMatch = catalog?.examples.some(
			(example) => path === `/src/examples/${type}/${catalog.component}/${example.name}.svelte`
		);

		// Check if this path matches page examples
		const pageMatch = pageExamples.some(
			(example) =>
				example.component &&
				example.name &&
				path === `/src/examples/${type}/${example.component}/${example.name}.svelte`
		);

		if (catalogMatch || pageMatch) {
			const component = (await allExamples[path]()) as Component;
			const source = (await allSources[path]()) as string;
			const pathParts = path.split('/');
			const componentName = pathParts[pathParts.length - 2];
			const filename = pathParts[pathParts.length - 1];
			const name = filename.replace('.svelte', '');

			// Remove `export { data };`
			// TODO: Also remove blank lines left behind
			const cleanupSource = source.replace(/^.*export .*;.*$/gm, '');

			if (!examples[componentName]) {
				examples[componentName] = {};
			}
			examples[componentName][name] = { component, source: cleanupSource };
		}
	}

	return examples;
}
