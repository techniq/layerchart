import { allComponents } from 'content-collections';
import type { ComponentCatalog } from '$examples/catalog/types.js';

interface ExampleInfo {
	component: string;
	category?: string;
	examples: Array<{
		name: string;
		title: string;
		path: string;
	}>;
}

export async function load() {
	const catalogModules = import.meta.glob<ComponentCatalog>('/src/examples/catalog/*.json', {
		eager: true,
		import: 'default'
	});

	// Create a map of component names to their categories
	const componentCategoryMap = new Map<string, string>();
	for (const component of allComponents) {
		if (component.category) {
			componentCategoryMap.set(component.name, component.category);
		}
	}

	// Build components list from catalog data
	const components: ExampleInfo[] = Object.values(catalogModules)
		.filter((catalog) => catalog.examples.length > 0)
		.map((catalog) => ({
			component: catalog.component,
			category: componentCategoryMap.get(catalog.component),
			examples: catalog.examples.map((example) => ({
				name: example.name,
				title: example.title,
				path: `/example/${catalog.component}/${example.name}`
			}))
		}))
		.sort((a, b) => a.component.localeCompare(b.component));

	return {
		components
	};
}
