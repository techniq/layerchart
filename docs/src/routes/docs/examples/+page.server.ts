import { allComponents } from 'content-collections';
import type { ComponentCatalog } from '@layerstack/docs/catalog';
import { nativeWebGLExamples, webglExamples } from 'virtual:webgl-examples';

import { componentLayers, intersectExampleLayers } from '$lib/utils/layers.js';

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
		/** The layers it draws in (ex. `['svg', 'canvas', 'webgl']`), as its page's layer toggle offers */
		layers: string[];
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
					createdAt: example.createdAt,
					layers: exampleLayers(slug, catalog.component, example)
				}))
			};
		})
		.sort((a, b) => a.label.localeCompare(b.label));

	return {
		components,
		metadata
	};
}

/**
 * The layers an example draws in, as its page's layer toggle offers them: those every component
 * it uses can draw in, and `webgl` when it has a WebGL version.  One written with
 * `@layerchart/webgl` draws in a `WebGL` layer only.
 */
function exampleLayers(
	slug: string,
	component: string,
	example: ComponentCatalog['examples'][number]
): string[] {
	const key = `${slug}/${example.name}`;
	if (nativeWebGLExamples.has(key)) return ['webgl'];
	const layers = intersectExampleLayers(example.components ?? [], componentLayers[component] ?? []);
	return key in webglExamples ? [...layers, 'webgl'] : layers;
}
