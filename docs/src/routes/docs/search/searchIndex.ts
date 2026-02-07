import {
	allComponents,
	allGuides,
	allUtils,
	type Component,
	type Guide,
	type Util
} from 'content-collections';
import type { Post } from './types';
import type { ComponentCatalog } from '$lib/../examples/catalog/types';

type SearchEntry = {
	title: string;
	slug: string;
	content: string;
	type: 'component' | 'example' | 'guide' | 'util';
	category?: string;
};

function componentToEntry(doc: Component): SearchEntry {
	return {
		title: doc.name,
		slug: `docs/components/${doc.slug}`,
		content: doc.description ?? '',
		type: 'component',
		category: doc.category
	};
}

function guideToEntry(doc: Guide): SearchEntry {
	return {
		title: doc.name,
		slug: `docs/guides/${doc.slug}`,
		content: doc.description ?? '',
		type: 'guide'
	};
}

function utilToEntry(doc: Util): SearchEntry {
	return {
		title: doc.name,
		slug: `docs/utils/${doc.slug}`,
		content: doc.description ?? '',
		type: 'util'
	};
}

// Load all catalog JSON files
const catalogModules = import.meta.glob<ComponentCatalog>(
	'/src/examples/catalog/*.json',
	{ eager: true, import: 'default' }
);

// Convert catalog entries to search entries
function catalogToEntries(): SearchEntry[] {
	const entries: SearchEntry[] = [];

	for (const [, catalog] of Object.entries(catalogModules)) {
		for (const example of catalog.examples) {
			entries.push({
				title: `${catalog.component}: ${example.name}`,
				slug: example.path.slice(1), // Remove leading slash
				content: `${catalog.component} example`,
				type: 'example'
			});
		}
	}

	return entries;
}

export const searchIndex: Post[] = [
	...allComponents.map(componentToEntry),
	...catalogToEntries(),
	...allGuides.map(guideToEntry),
	...allUtils.map(utilToEntry)
];
