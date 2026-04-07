import { renderChartResponse } from '../renderChartEndpoint.js';
import type { RequestHandler } from './$types';
import AreaChart from './AreaChart.svelte';

export const prerender = true;

const data = Array.from({ length: 50 }, (_, i) => ({
	date: i,
	value: 50 + 30 * Math.sin(i / 5) + 10 * Math.cos(i / 3),
	value2: 70 + 20 * Math.cos(i / 4) + 15 * Math.sin(i / 7)
}));

export const GET: RequestHandler = async ({ url }) => {
	return renderChartResponse({
		component: AreaChart,
		props: { data },
		url
	});
};
