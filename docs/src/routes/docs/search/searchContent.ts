import {
	allComponents,
	allGuides,
	allUtils,
	type Component,
	type Guide,
	type Util
} from 'content-collections';
import type { ComponentCatalog } from '$lib/../examples/catalog/types';
import { stripMarkdown } from '$lib/markdown/utils.js';

export type SearchEntry = {
	title: string;
	slug: string;
	content: string;
	type: 'component' | 'example' | 'guide' | 'util';
	category?: string;
	/** For examples, the component name (e.g., 'AreaChart') */
	component?: string;
	/** For examples, the example name (e.g., 'basic') */
	example?: string;
};

function componentToEntry(doc: Component): SearchEntry {
	const description = doc.description ?? '';
	const markdownContent = stripMarkdown(doc.content);

	return {
		title: doc.name,
		slug: `docs/components/${doc.slug}`,
		content: description ? `${description} ${markdownContent}` : markdownContent,
		type: 'component',
		category: doc.category
	};
}

function guideToEntry(doc: Guide): SearchEntry {
	const description = doc.description ?? '';
	const markdownContent = stripMarkdown(doc.content);

	return {
		title: doc.name,
		slug: `docs/guides/${doc.slug}`,
		content: description ? `${description} ${markdownContent}` : markdownContent,
		type: 'guide'
	};
}

function utilToEntry(doc: Util): SearchEntry {
	const description = doc.description ?? '';
	const markdownContent = stripMarkdown(doc.content);

	return {
		title: doc.name,
		slug: `docs/utils/${doc.slug}`,
		content: description ? `${description} ${markdownContent}` : markdownContent,
		type: 'util'
	};
}

// Load all catalog JSON files
const catalogModules = import.meta.glob<ComponentCatalog>('/src/examples/catalog/*.json', {
	eager: true,
	import: 'default'
});

// Convert catalog entries to search entries
function catalogToEntries(): SearchEntry[] {
	const entries: SearchEntry[] = [];

	for (const [, catalog] of Object.entries(catalogModules)) {
		for (const example of catalog.examples) {
			entries.push({
				title: example.title,
				slug: example.path.slice(1), // Remove leading slash
				content: catalog.component,
				type: 'example',
				component: catalog.component,
				example: example.name
			});
		}
	}

	return entries;
}

export const searchContent: SearchEntry[] = [
	...allComponents.map(componentToEntry),
	...catalogToEntries(),
	...allGuides.map(guideToEntry),
	...allUtils.map(utilToEntry)
];
