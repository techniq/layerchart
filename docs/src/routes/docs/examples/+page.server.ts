import { allComponents } from 'content-collections';
import type { ComponentCatalog } from '@layerstack/docs/catalog';

import { metadata } from './metadata';

interface ExampleInfo {
	/** The component's slug, as its route and screenshots use it (ex. `Area`) */
	component: string;
	/** What to call the component (ex. `Area`) */
	label: string;
	category?: string;
	examples: Array<{
		name: string;
		title: string;
		path: string;
		/** The commit that first added the example's file (absent until it's committed) */
		createdAt?: string;
	}>;
}

export async function load() {
	// `@layerchart/webgl`'s catalogs sit in `webgl/`, used for its own components (ex. `Surface`):
	// LayerChart's catalogs list every example of theirs, whichever package draws it
	const catalogModules = import.meta.glob<ComponentCatalog>('/src/examples/catalog/**/*.json', {
		eager: true,
		import: 'default'
	});

	// Create a map of component slugs to their categories
	const componentCategoryMap = new Map<string, string>();
	for (const component of allComponents) {
		if (component.category) {
			componentCategoryMap.set(component.slug, component.category);
		}
	}

	// Build components list from catalog data
	const slugOf = (path: string) => path.replace(/^.*\//, '').replace(/\.json$/, '');
	const core = new Set(
		Object.keys(catalogModules)
			.filter((path) => !path.includes('/catalog/webgl/'))
			.map(slugOf)
	);
	const components: ExampleInfo[] = Object.entries(catalogModules)
		.filter(([path, catalog]) => {
			if (!catalog.examples.length) return false;
			// `@layerchart/webgl`'s own only, with a page of their own
			if (!path.includes('/catalog/webgl/')) return true;
			const slug = slugOf(path);
			return !core.has(slug) && componentCategoryMap.has(slug);
		})
		.map(([path, catalog]) => {
			const slug = slugOf(path);
			return {
				component: slug,
				label: catalog.component,
				category: componentCategoryMap.get(slug),
				examples: catalog.examples.map((example) => ({
					name: example.name,
					title: example.title,
					path: `/docs/components/${slug}/${example.name}`,
					createdAt: example.createdAt
				}))
			};
		})
		.sort((a, b) => a.label.localeCompare(b.label));

	return {
		components,
		metadata
	};
}
