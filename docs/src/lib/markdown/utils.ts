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

	// get full metadata (authored frontmatter + content-collection transformed)
	const metadata =
		type === 'components'
			? allComponents.find((c) => c.slug === slug)
			: allExamples.find((e) => e.slug === slug);

	if (!doc || !metadata) {
		error(404, 'Could not find the document.');
	}

	return {
		PageComponent: doc.default,
		metadata
	};
}
