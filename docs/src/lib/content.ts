import { error } from '@sveltejs/kit';
import {
	allComponents,
	type Component as ComponentMetadata,
	allUtils,
	type Util as UtilMetadata,
	allGuides,
	type Guide as GuideMetadata
} from 'content-collections';
import { createContentLoaders, type ContentType } from '@layerstack/docs/content';
import { loadExample, loadExampleByPath } from '$lib/examples.js';

type Metadata = ComponentMetadata | UtilMetadata | GuideMetadata;

const modules = import.meta.glob<{ default: import('svelte').Component; metadata: Metadata }>(
	'/src/content/**/*.md'
);

const contentLoaders = createContentLoaders<Metadata>({
	modules,
	getMetadata,
	loadExample,
	loadExampleByPath,
	notFound: () => error(404, 'Could not find the document.')
});

function getMetadata(slug: string, type: ContentType): Metadata | undefined {
	if (type === 'guides') {
		return allGuides.find((g) => g.slug === slug);
	}
	if (type === 'utils') {
		return allUtils.find((u) => u.slug === slug);
	}
	return allComponents.find((c) => c.slug === slug);
}

export const { getMarkdownComponent, loadExamplesFromMarkdown } = contentLoaders;
