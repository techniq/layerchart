<script lang="ts">
	import { BarChart } from 'layerchart';
	import { wideData } from '$lib/utils/data.js';

	const data = wideData;

	export { data };
</script>

<BarChart
	{data}
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
	seriesLayout="stack"
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		bars: { radius: 5.0, rounded: 'all' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	stackPadding={5.0}
	height={300}
/>
