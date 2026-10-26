import type { ComponentCatalog } from '@layerstack/docs/catalog';
import { extractExampleReferences } from '@layerstack/docs/content';
import { componentLayers, intersectExampleLayers } from '$lib/utils/layers.js';

const allCatalogs = import.meta.glob<ComponentCatalog>('/src/examples/catalog/*.json', {
	import: 'default'
});

/**
 * Layers supported by every example referenced in a markdown page, so the page-wide layer toggle
 * only offers layers that all of its examples can render.
 *
 * Computed on the server so pages don't download example catalogs just to build the toggle.
 */
export async function getMarkdownLayers(
	markdown: string,
	defaultComponent?: string
): Promise<string[]> {
	const exampleLayers = await Promise.all(
		extractExampleReferences(markdown).map(async (ref) => {
			if (ref.kind !== 'component') return [];
			const component = ref.component ?? defaultComponent;
			if (!component) return [];

			const catalogPath = `/src/examples/catalog/${component}.json`;
			const catalog = catalogPath in allCatalogs ? await allCatalogs[catalogPath]() : null;
			const usages = catalog?.examples.find((e) => e.name === ref.name)?.components ?? [];
			return intersectExampleLayers(usages, componentLayers[component] ?? []);
		})
	);

	const constrained = exampleLayers.filter((layers) => layers.length > 0);
	if (constrained.length === 0) return [];
	return constrained.reduce((acc, next) => acc.filter((l) => next.includes(l)));
}
