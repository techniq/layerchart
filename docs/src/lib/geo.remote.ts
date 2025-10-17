import { getRequestEvent, prerender } from '$app/server';
import type { GeometryCollection, Topology } from 'topojson-specification';

export const getCountries = prerender(async () => {
	const { fetch } = getRequestEvent();
	const geojson = (await fetch(
		'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
	).then((r) => r.json())) as Topology<{
		countries: GeometryCollection<{ name: string }>;
		land: GeometryCollection;
	}>;
	return geojson;
});
