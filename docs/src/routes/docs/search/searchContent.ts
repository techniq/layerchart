import { allComponents, allGuides, allUtils } from 'content-collections';
import type { ComponentCatalog } from '@layerstack/docs/catalog';
import { buildSearchEntries, type SearchEntry } from '@layerstack/docs/search';

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
				content: [
					catalog.component,
					example.name.replaceAll('-', ' '),
					...(example.tags ?? [])
				].join(' '),
				type: 'example',
				component: catalog.component,
				example: example.name,
				tags: example.tags
			});
		}
	}

	return entries;
}

// Top-level documentation pages
const topLevelPages: SearchEntry[] = [
	{
		title: 'Getting Started',
		slug: 'docs/getting-started',
		content:
			'Install LayerChart and create your first chart. Setup guide for SvelteKit with Tailwind CSS, shadcn-svelte, Skeleton, Svelte UX, daisyUI, and UnoCSS.',
		type: 'page'
	},
	{
		title: 'Examples',
		slug: 'docs/examples',
		content: 'Browse example charts and visualizations',
		type: 'page'
	},
	{
		title: 'Playground',
		slug: 'docs/playground',
		content:
			'Interactive playground to experiment with LayerChart components. Try code examples in StackBlitz.',
		type: 'page'
	},
	{
		title: 'Showcase',
		slug: 'docs/showcase',
		content:
			'Real-world projects and websites built with LayerChart. Community examples and inspiration.',
		type: 'page'
	},
	{
		title: 'Releases',
		slug: 'docs/releases',
		content: 'Release notes and changelog for LayerChart. Version history and updates.',
		type: 'page'
	}
];

export const searchContent: SearchEntry[] = [
	...topLevelPages,
	...buildSearchEntries(allComponents, {
		type: 'component',
		slugPrefix: 'docs/components',
		category: (doc) => doc.category,
		headingCategory: true
	}),
	...catalogToEntries(),
	...buildSearchEntries(allGuides, { type: 'guide', slugPrefix: 'docs/guides' }),
	...buildSearchEntries(allUtils, { type: 'util', slugPrefix: 'docs/utils' })
];
