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
		{ key: 'apples', label: 'Apples 🍏 ', color: 'var(--color-apples)' },
		{
			key: 'bananas',
			label: 'Bananas 🍌',
			color: 'var(--color-bananas)'
		},
		{
			key: 'oranges',
			label: 'Oranges 🍊',
			color: 'var(--color-oranges)'
		}
	]}
	legend
	seriesLayout="stack"
	padding={defaultChartPadding({ legend: true, right: 10 })}
	height={300}
/>
