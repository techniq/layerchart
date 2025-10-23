<script lang="ts">
	import { BarChart } from 'layerchart';
	import { wideData } from '$lib/utils/data.js';

	const data = wideData;

	export { data };
</script>

<BarChart
	{data}
	orientation="horizontal"
	y="year"
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
		xAxis: { format: 'metric' },
		yAxis: { format: 'none' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	height={300}
/>
