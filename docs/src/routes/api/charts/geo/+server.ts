import { geoAlbersUsa } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { renderChartResponse } from '../renderChartEndpoint.js';
import type { RequestHandler } from './$types';
import GeoChart from './GeoChart.svelte';

export const prerender = true;

let cachedStates: ReturnType<typeof feature> | null = null;

async function getStates(fetchFn: typeof fetch) {
	if (cachedStates) return cachedStates;
	const topology = (await fetchFn(
		'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
	).then((r) => r.json())) as Topology<{
		states: GeometryCollection<{ name: string }>;
	}>;
	cachedStates = feature(topology, topology.objects.states);
	return cachedStates;
}

export const GET: RequestHandler = async ({ url, fetch }) => {
	const states = await getStates(fetch);

	return renderChartResponse({
		component: GeoChart,
		props: { states, projection: geoAlbersUsa },
		url
	});
};
