<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	series={[
		{ key: 'apples', value: (d) => -d.apples, color: 'var(--color-apples)' },
		{
			key: 'bananas',
			color: 'var(--color-bananas)'
		},
		{
			key: 'oranges',
			color: 'var(--color-oranges)'
		}
	]}
	seriesLayout="stackDiverging"
	padding={{ ...defaultChartPadding(), right: 10 }}
	height={300}
/>
