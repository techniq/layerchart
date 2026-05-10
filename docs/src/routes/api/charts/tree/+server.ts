import { renderChartResponse } from '../renderChartEndpoint.js';
import type { RequestHandler } from './$types';
import TreeChart from './TreeChart.svelte';

export const prerender = true;

const data = {
	name: 'root',
	children: [
		{
			name: 'A',
			children: [{ name: 'A1' }, { name: 'A2' }, { name: 'A3' }]
		},
		{
			name: 'B',
			children: [
				{
					name: 'B1',
					children: [{ name: 'B1a' }, { name: 'B1b' }]
				},
				{ name: 'B2' }
			]
		},
		{
			name: 'C',
			children: [{ name: 'C1' }, { name: 'C2' }]
		}
	]
};

export const GET: RequestHandler = async ({ url }) => {
	return renderChartResponse({
		component: TreeChart,
		props: { data },
		url
	});
};
