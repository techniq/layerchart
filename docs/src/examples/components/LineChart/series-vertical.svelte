<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
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

<div class="flex justify-center">
	<LineChart
		{data}
		y="date"
		series={[
			{ key: 'apples', color: 'var(--color-apples)' },
			{
				key: 'bananas',
				color: 'var(--color-bananas)'
			},
			{
				key: 'oranges',
				color: 'var(--color-oranges)'
			}
		]}
		orientation="vertical"
		padding={{ ...defaultChartPadding(), bottom: 25, left: 25 }}
		height={600}
		width={400}
	/>
</div>
