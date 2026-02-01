import type { Component } from 'svelte';
import { error } from '@sveltejs/kit';

import {
	allComponents,
	type Component as ComponentMetadata,
	type Example as ExampleMetadata,
	allUtils,
	type Util as UtilMetadata,
	allGuides,
	type Guide as GuideMetadata
} from 'content-collections';

import type { Examples } from '$lib/types.js';
import { loadExample, loadExampleByPath } from '$lib/examples.js';

/**
 * Get markdown document component and metadata (frontmatter)
 * @param slug
 * @param type - The type of content ('components' or 'utils')
 * @returns
 */
export async function getMarkdownComponent(
	slug: string = 'index',
	type: 'components' | 'utils' | 'guides' = 'components'
) {
	const modules = import.meta.glob<{
		default: Component;
		metadata: ComponentMetadata | ExampleMetadata | UtilMetadata | GuideMetadata;
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
	type: 'components' | 'utils' | 'guides' = 'components'
): ComponentMetadata | UtilMetadata | GuideMetadata {
	if (type === 'guides') {
		return allGuides.find((g) => g.slug === slug) as any;
	}
	if (type === 'utils') {
		return allUtils.find((u) => u.slug === slug) as any;
	}
	return allComponents.find((c) => c.slug === slug) as any;
}

/**
 * Resolve a relative or absolute path to a full path from /src
 * @param path - The path from the example (e.g., "./color-schemes.svelte" or "/routes/docs/guides/styles/color-schemes.svelte")
 * @param currentPath - The current page URL pathname (e.g., "/docs/guides/styles")
 * @returns The resolved path (e.g., "/src/routes/docs/guides/styles/color-schemes.svelte")
 */
export function resolveExamplePath(path: string, currentPath: string, type?: string): string {
	if (type === 'guides' && (path.startsWith('./') || !path.startsWith('/'))) {
		// For guides, resolve relative to src/content/guides/
		const relativePath = path.startsWith('./') ? path.slice(2) : path;
		return `/src/content/guides/${relativePath}`;
	}
	if (path.startsWith('./')) {
		return `/src/routes${currentPath}/${path.slice(2)}`;
	} else if (path.startsWith('/')) {
		return `/src${path}`;
	} else {
		return `/src/routes${currentPath}/${path}`;
	}
}

/**
 * Extract examples from markdown content and eagerly load them.
 *
 * Only examples explicitly referenced in the markdown are loaded - the catalog
 * is NOT used here to avoid loading all examples when only a few are shown.
 *
 * @param markdownContent - The markdown content to extract examples from
 * @param defaultComponent - Optional default component name (from route params)
 * @param type - The type of content ('components' or 'utils')
 * @param currentPath - The current page URL pathname (needed for resolving relative paths)
 * @returns Examples object with loaded components and sources
 */
export async function loadExamplesFromMarkdown(
	markdownContent: string,
	defaultComponent?: string,
	type: 'components' | 'utils' | 'guides' = 'components',
	currentPath?: string
): Promise<Examples> {
	// Extract all <Example component="..." name="..."> from markdown content
	// Also support :example{component="..." name="..."} syntax
	const componentRegex = /<Example\s+([^>]*?)\/>/g;
	const mdcRegex = /:example\{([^}]*?)\}/g;
	const componentMatches = [...markdownContent.matchAll(componentRegex)];
	const mdcMatches = [...markdownContent.matchAll(mdcRegex)];
	const matches = [...componentMatches, ...mdcMatches];

	const componentExamples: Array<{ component: string; name: string }> = [];
	const pathExamples: Array<{ path: string; resolvedPath: string }> = [];

	for (const match of matches) {
		const attrs = match[1];
		const path = attrs.match(/path="([^"]*?)"/)?.[1];

		if (path && currentPath) {
			// Path-based example
			const resolvedPath = resolveExamplePath(path, currentPath, type);
			pathExamples.push({ path, resolvedPath });
		} else {
			// Component/name-based example
			const component = attrs.match(/component="([^"]*?)"/)?.[1] || defaultComponent;
			const name = attrs.match(/name="([^"]*?)"/)?.[1] || null;
			if (component && name) {
				componentExamples.push({ component, name });
			}
		}
	}

	const examples: Examples = {};

	// Load component-based examples in parallel
	await Promise.all(
		componentExamples.map(async (ex) => {
			const loaded = await loadExample(
				ex.component,
				ex.name,
				type === 'guides' ? 'components' : type
			);
			if (loaded) {
				if (!examples[ex.component]) {
					examples[ex.component] = {};
				}
				examples[ex.component][ex.name] = loaded;
			}
		})
	);

	// Load path-based examples in parallel
	if (pathExamples.length > 0) {
		examples['__path__'] = {};
		await Promise.all(
			pathExamples.map(async (ex) => {
				const loaded = await loadExampleByPath(ex.resolvedPath);
				if (loaded) {
					examples['__path__']![ex.resolvedPath] = loaded;
				}
			})
		);
	}

	return examples;
}
