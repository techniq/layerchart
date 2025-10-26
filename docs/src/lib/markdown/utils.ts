import type { Component } from 'svelte';
import { error } from '@sveltejs/kit';

import {
	allComponents,
	type Component as ComponentMetadata,
	allExamples,
	type Example as ExampleMetadata
} from 'content-collections';

/**
 * Get markdown document component and metadata (frontmatter)
 * @param type
 * @param slug
 * @returns
 */
export async function getMarkdownComponent(
	type: 'components' | 'examples',
	slug: string = 'index'
) {
	const modules = import.meta.glob<{
		default: Component;
		metadata: ComponentMetadata | ExampleMetadata;
	}>('/src/content/**/*.md');

	let doc: Awaited<ReturnType<(typeof modules)[string]>> | null = null;
	for (const [path, resolver] of Object.entries(modules)) {
		if (path === `/src/content/${type}/${slug}.md`) {
			doc = await resolver();
			break;
		}
	}

	const metadata = getMetadata(type, slug);

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
function getMetadata<T extends 'components' | 'examples'>(
	type: T,
	slug: string
): T extends 'components' ? ComponentMetadata : ExampleMetadata {
	return (
		type === 'components'
			? allComponents.find((c) => c.slug === slug)
			: allExamples.find((e) => e.slug === slug)
	) as any;
}
