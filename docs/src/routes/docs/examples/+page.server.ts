import { allComponents } from 'content-collections';
import type { ComponentCatalog } from '@layerstack/docs/catalog';

import { metadata } from './metadata';

interface ExampleInfo {
	/** The component's slug, as its route and screenshots use it (ex. `Area`, `webgl/Area`) */
	component: string;
	/** What to call the component (ex. `Area`, `Area (WebGL)`) */
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
	// `@layerchart/webgl`'s catalogs sit in `webgl/`, as their names repeat LayerChart's (ex. `Area`)
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
	const components: ExampleInfo[] = Object.entries(catalogModules)
		.filter(([, catalog]) => catalog.examples.length > 0)
		.map(([path, catalog]) => {
			const slug = path.replace('/src/examples/catalog/', '').replace(/\.json$/, '');
			const isWebGL = slug.startsWith('webgl/');
			return {
				component: slug,
				label:
					isWebGL && catalog.component !== 'WebGL'
						? `${catalog.component} (WebGL)`
						: catalog.component,
				category: componentCategoryMap.get(slug),
				examples: catalog.examples.map((example) => ({
					name: example.name,
					title: example.title,
					path: `/docs/components/${slug}/${example.name}`,
					createdAt: example.createdAt
				}))
			};
		})
		// Each WebGL component right after its LayerChart namesake
		.sort((a, b) => a.label.localeCompare(b.label));

	return {
		components,
		metadata
	};
}
