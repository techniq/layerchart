import { renderChartResponse } from '../renderChartEndpoint.js';
import type { RequestHandler } from './$types';
import TreemapChart from './TreemapChart.svelte';

export const prerender = true;

const data = {
	name: 'World',
	children: [
		{
			name: 'Europe',
			children: [
				{ name: 'Western Europe', value: 200 },
				{ name: 'Southern Europe', value: 151 },
				{ name: 'Eastern Europe', value: 284 },
				{ name: 'Northern Europe', value: 109 }
			]
		},
		{
			name: 'Asia',
			children: [
				{ name: 'East Asia', value: 1652 },
				{ name: 'South Asia', value: 2085 },
				{ name: 'Southeast Asia', value: 700 },
				{ name: 'Western Asia', value: 314 },
				{ name: 'Central Asia', value: 84 }
			]
		},
		{
			name: 'North America',
			children: [
				{ name: 'Northern America', value: 388 },
				{ name: 'Central America', value: 184 }
			]
		},
		{
			name: 'South America',
			children: [{ name: 'South America', value: 434 }]
		},
		{
			name: 'Africa',
			children: [
				{ name: 'Western Africa', value: 467 },
				{ name: 'Southern Africa', value: 74 },
				{ name: 'Northern Africa', value: 276 },
				{ name: 'Eastern Africa', value: 513 },
				{ name: 'Middle Africa', value: 220 }
			]
		},
		{
			name: 'Oceania',
			children: [{ name: 'Oceania', value: 47 }]
		}
	]
};

export const GET: RequestHandler = async ({ url }) => {
	return renderChartResponse({
		component: TreemapChart,
		props: { data },
		url
	});
};
