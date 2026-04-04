import { renderChartResponse } from '../renderChartEndpoint.js';
import type { RequestHandler } from './$types';
import LineChart from './LineChart.svelte';

const data = Array.from({ length: 50 }, (_, i) => ({
	date: i,
	value: 50 + 30 * Math.sin(i / 5) + 10 * Math.cos(i / 3)
}));

export const GET: RequestHandler = async ({ url }) => {
	return renderChartResponse({
		component: LineChart,
		props: { data },
		url
	});
};
