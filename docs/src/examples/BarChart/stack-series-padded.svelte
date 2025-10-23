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
		{ key: 'apples', color: 'var(--color-danger)' },
		{
			key: 'bananas',
			color: 'var(--color-warning)'
		},
		{
			key: 'cherries',
			color: 'var(--color-success)'
		},
		{
			key: 'grapes',
			color: 'var(--color-info)'
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
