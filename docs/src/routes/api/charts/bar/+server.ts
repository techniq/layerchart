import { renderChartResponse } from '../renderChartEndpoint.js';
import type { RequestHandler } from './$types';
import BarChart from './BarChart.svelte';

const data = [
	{ category: 'A', value: 28 },
	{ category: 'B', value: 55 },
	{ category: 'C', value: 43 },
	{ category: 'D', value: 91 },
	{ category: 'E', value: 81 },
	{ category: 'F', value: 53 },
	{ category: 'G', value: 19 },
	{ category: 'H', value: 67 }
];

export const GET: RequestHandler = async ({ url }) => {
	return renderChartResponse({
		component: BarChart,
		props: { data },
		url
	});
};
