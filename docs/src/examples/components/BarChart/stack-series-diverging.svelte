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
		{
			key: 'apples',
			color: 'var(--color-apples)',
			props: { rounded: 'bottom' }
		},
		{
			key: 'bananas',
			value: (d) => -d.bananas,
			color: 'var(--color-bananas)',
			props: { rounded: 'top' }
		}
	]}
	seriesLayout="stackDiverging"
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	height={300}
/>
