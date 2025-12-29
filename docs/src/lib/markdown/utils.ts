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

import type { Examples, LoadedExample } from '$lib/types.js';

/**
 * Helper to clean up source code by removing export statements
 */
function cleanupSourceCode(source: string): string {
	return source.replace(/^.*export .*;.*$/gm, '');
}

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
 * Extract examples from markdown content and eagerly load them.
 *
 * Only examples explicitly referenced in the markdown are loaded - the catalog
 * is NOT used here to avoid loading all examples when only a few are shown.
 *
 * @param markdownContent - The markdown content to extract examples from
 * @param allExamples - Glob import of all example components
 * @param allSources - Glob import of all example sources
 * @param defaultComponent - Optional default component name (from route params)
 * @param type - The type of content ('components' or 'utils')
 * @param currentPath - Optional current path for resolving relative paths
 * @returns Examples object with loaded components and sources
 */
export async function loadExamplesFromMarkdown(
	markdownContent: string,
	allExamples: Record<string, () => Promise<any>>,
	allSources: Record<string, () => Promise<any>>,
	defaultComponent?: string,
	type: 'components' | 'utils' = 'components',
	currentPath?: string
): Promise<Examples> {
	// Extract all <Example component="..." name="..."> and <Example path="..."> from markdown content
	// Also support :example{component="..." name="..."} and :example{path="..."} syntax
	const componentRegex = /<Example\s+([^>]*?)\/>/g;
	const mdcRegex = /:example\{([^}]*?)\}/g;
	const componentMatches = [...markdownContent.matchAll(componentRegex)];
	const mdcMatches = [...markdownContent.matchAll(mdcRegex)];
	const matches = [...componentMatches, ...mdcMatches];
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

	// Collect all load promises
	const loadPromises: Promise<void>[] = [];

	// Handle path-based examples
	for (const example of pageExamples) {
		if (example.path && currentPath) {
			const resolvedPath = resolveExamplePath(example.path, currentPath);

			if (allSvelteComponents[resolvedPath] && allSvelteSources[resolvedPath]) {
				loadPromises.push(
					(async () => {
						const [componentModule, rawSource] = await Promise.all([
							allSvelteComponents[resolvedPath](),
							allSvelteSources[resolvedPath]()
						]);

						if (!examples['__path__']) {
							examples['__path__'] = {};
						}

						examples['__path__'][resolvedPath] = {
							component: (componentModule as any).default,
							source: cleanupSourceCode(rawSource as string)
						} satisfies LoadedExample;
					})()
				);
			}
		}
	}

	// Handle traditional component/name-based examples
	// ONLY for examples referenced in the markdown content (not the full catalog)
	// This ensures we don't load 54 examples when only 1 is shown on the page
	for (const example of pageExamples) {
		if (example.component && example.name) {
			const examplePath = `/src/examples/${type}/${example.component}/${example.name}.svelte`;

			if (allExamples[examplePath] && allSources[examplePath]) {
				loadPromises.push(
					(async () => {
						const [componentModule, rawSource] = await Promise.all([
							allExamples[examplePath](),
							allSources[examplePath]()
						]);

						if (!examples[example.component!]) {
							examples[example.component!] = {};
						}

						examples[example.component!][example.name!] = {
							component: (componentModule as any).default ?? componentModule,
							source: cleanupSourceCode(rawSource as string)
						} satisfies LoadedExample;
					})()
				);
			}
		}
	}

	// Wait for all examples to load in parallel
	await Promise.all(loadPromises);

	return examples;
}
