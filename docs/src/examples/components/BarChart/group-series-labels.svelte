<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import { wideData } from '$lib/utils/data.js';

	const data = wideData;
	export { data };
</script>

<BarChart
	data={wideData}
	x="year"
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{
			key: 'bananas',
			color: 'var(--color-bananas)'
		},
		{
			key: 'cherries',
			color: 'var(--color-cherries)'
		},
		{
			key: 'grapes',
			color: 'var(--color-grapes)'
		}
	]}
	seriesLayout="group"
	bandPadding={0.2}
	labels
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	padding={defaultChartPadding({ left: 24 })}
	height={300}
/>
