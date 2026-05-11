import { allComponents } from 'content-collections';
import type { ComponentUsageInExample } from '@layerstack/docs/catalog';

/**
 * Map of component name -> supported layers, derived from markdown frontmatter.
 * Components with an empty `layers` array (e.g. Chart, Svg, Canvas, Html) are
 * treated as layer-agnostic and are skipped during intersection.
 */
export const componentLayers: Record<string, string[]> = Object.fromEntries(
	allComponents.map((c) => [c.name, c.layers])
);

/**
 * Components that render outside any `<Svg|Canvas|Html>` layer (e.g. Legend,
 * CircleLegend, GeoLegend) and therefore don't constrain layer choice for the
 * rest of the chart. Marked via `withinLayer: false` in markdown frontmatter.
 */
const outsideLayerComponents = new Set(
	allComponents.filter((c) => c.withinLayer === false).map((c) => c.name)
);

/**
 * Compute the supported layers for an example by intersecting the layers
 * of the page component and every component it uses.
 *
 * The page component participates because catalogs don't always list it
 * (e.g. `<Marker>` is supplied via props on a child, not used as an element).
 *
 * - Components not in the registry are skipped (assumed layer-agnostic).
 * - Components whose frontmatter `layers` is empty are skipped.
 * - Returns `pageComponentLayers` if no component constrains the set, or if
 *   the intersection is empty (which would leave the toggle with no options).
 */
export function intersectExampleLayers(
	usages: Pick<ComponentUsageInExample, 'component'>[],
	pageComponentLayers: string[]
): string[] {
	const sources: string[][] = [];
	if (pageComponentLayers.length > 0) sources.push(pageComponentLayers);
	for (const { component } of usages) {
		if (outsideLayerComponents.has(component)) continue;
		const layers = componentLayers[component];
		if (!layers || layers.length === 0) continue;
		sources.push(layers);
	}
	if (sources.length === 0) return pageComponentLayers;

	const result = sources.reduce((acc, next) => acc.filter((l) => next.includes(l)));
	return result.length > 0 ? result : pageComponentLayers;
}
