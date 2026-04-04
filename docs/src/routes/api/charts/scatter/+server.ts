import { renderChartResponse } from '../renderChartEndpoint.js';
import type { RequestHandler } from './$types';
import ScatterChart from './ScatterChart.svelte';

// Generate clustered scatter data
const random = (seed: number) => {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
};

const data = Array.from({ length: 100 }, (_, i) => ({
	x: random(i * 3 + 1) * 100,
	y: random(i * 3 + 2) * 100
}));

export const GET: RequestHandler = async ({ url }) => {
	return renderChartResponse({
		component: ScatterChart,
		props: { data },
		url
	});
};
