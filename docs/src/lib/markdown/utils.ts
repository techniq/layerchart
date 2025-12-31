import type { Component } from 'svelte';
import { error } from '@sveltejs/kit';

import {
	allComponents,
	type Component as ComponentMetadata,
	type Example as ExampleMetadata,
	allUtils,
	type Util as UtilMetadata
} from 'content-collections';

import type { Examples } from '$lib/types.js';
import { loadExample } from '$lib/examples.js';

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
 * @param defaultComponent - Optional default component name (from route params)
 * @param type - The type of content ('components' or 'utils')
 * @returns Examples object with loaded components and sources
 */
export async function loadExamplesFromMarkdown(
	markdownContent: string,
	defaultComponent?: string,
	type: 'components' | 'utils' = 'components'
): Promise<Examples> {
	// Extract all <Example component="..." name="..."> from markdown content
	// Also support :example{component="..." name="..."} syntax
	const componentRegex = /<Example\s+([^>]*?)\/>/g;
	const mdcRegex = /:example\{([^}]*?)\}/g;
	const componentMatches = [...markdownContent.matchAll(componentRegex)];
	const mdcMatches = [...markdownContent.matchAll(mdcRegex)];
	const matches = [...componentMatches, ...mdcMatches];
	const pageExamples = matches.map((match) => {
		const attrs = match[1];
		const component = attrs.match(/component="([^"]*?)"/)?.[1] || defaultComponent;
		const name = attrs.match(/name="([^"]*?)"/)?.[1] || null;
		return { component, name };
	});

	const examples: Examples = {};

	// Load examples in parallel using dynamic imports
	await Promise.all(
		pageExamples
			.filter((ex) => ex.component && ex.name)
			.map(async (ex) => {
				const loaded = await loadExample(ex.component!, ex.name!, type);
				if (loaded) {
					if (!examples[ex.component!]) {
						examples[ex.component!] = {};
					}
					examples[ex.component!][ex.name!] = loaded;
				}
			})
	);

	return examples;
}
