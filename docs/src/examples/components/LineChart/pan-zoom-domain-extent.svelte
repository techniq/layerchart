<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 365,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value']
	});
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 50],
		domainExtent: {
			x: {
				min: 'data',
				max: 'data',
				minRange: 7 * 24 * 60 * 60 * 1000
			}
		}
	}}
	padding={defaultChartPadding({ left: 25 })}
	height={300}
/>
