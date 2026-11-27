import { allComponents, allGuides, allUtils } from 'content-collections';
import type { ComponentCatalog } from '@layerstack/docs/catalog';
import { buildSearchEntries, type SearchEntry } from '@layerstack/docs/search';

// Load all catalog JSON files (`webgl/` holds `@layerchart/webgl`'s, used for its own components,
// ex. `Surface`: LayerChart's list every example of theirs, whichever package draws it)
const catalogModules = import.meta.glob<ComponentCatalog>('/src/examples/catalog/**/*.json', {
	eager: true,
	import: 'default'
});

// Convert catalog entries to search entries
function catalogToEntries(): SearchEntry[] {
	const entries: SearchEntry[] = [];
	const core = new Set(
		Object.entries(catalogModules)
			.filter(([file]) => !file.includes('/catalog/webgl/'))
			.map(([, catalog]) => catalog.component)
	);
	const pages = new Set(allComponents.map((c) => c.slug));

	for (const [file, catalog] of Object.entries(catalogModules)) {
		const component = catalog.component;
		if (file.includes('/catalog/webgl/') && (core.has(component) || !pages.has(component))) {
			continue;
		}
		for (const example of catalog.examples) {
			// Drawn in a `WebGL` layer, found searching for it
			const webgl = example.components?.some((usage) => usage.component === 'WebGL');
			entries.push({
				title: example.title,
				slug: `docs/components/${component}/${example.name}`,
				content: [
					component,
					webgl ? 'WebGL' : '',
					example.name.replaceAll('-', ' '),
					...(example.tags ?? [])
				].join(' '),
				type: 'example',
				component,
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
