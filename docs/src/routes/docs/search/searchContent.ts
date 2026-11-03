import { allComponents, allGuides, allUtils } from 'content-collections';
import type { ComponentCatalog } from '@layerstack/docs/catalog';
import { buildSearchEntries, type SearchEntry } from '@layerstack/docs/search';

// Load all catalog JSON files (`webgl/` holds `@layerchart/webgl`'s)
const catalogModules = import.meta.glob<ComponentCatalog>('/src/examples/catalog/**/*.json', {
	eager: true,
	import: 'default'
});

// Convert catalog entries to search entries
function catalogToEntries(): SearchEntry[] {
	const entries: SearchEntry[] = [];

	for (const [file, catalog] of Object.entries(catalogModules)) {
		// `@layerchart/webgl`'s examples are on its pages, `webgl/<name>`
		const webgl = file.includes('/catalog/webgl/');
		const component = webgl ? `webgl/${catalog.component}` : catalog.component;
		for (const example of catalog.examples) {
			entries.push({
				title: example.title,
				slug: webgl ? `docs/components/${component}/${example.name}` : example.path.slice(1), // Remove leading slash
				content: [
					catalog.component,
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

const WEBGL_PAGES = 'docs/components/webgl/';

/**
 * `@layerchart/webgl`'s pages repeat LayerChart's names (ex. `Arc`), so their results (and their
 * sections' and examples') say they're WebGL's
 */
function markWebGL(entry: SearchEntry): SearchEntry {
	const slug = entry.type === 'heading' ? entry.parentSlug : entry.slug;
	if (!slug?.startsWith(WEBGL_PAGES)) return entry;
	if (entry.type === 'heading') return { ...entry, parent: `${entry.parent} (WebGL)` };
	return { ...entry, title: `${entry.title} (WebGL)` };
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
].map(markWebGL);
