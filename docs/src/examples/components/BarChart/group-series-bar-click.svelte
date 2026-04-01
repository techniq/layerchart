<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import { wideData } from '$lib/utils/data.js';

	const data = wideData;
	export { data };
</script>

<!-- Currently `onbarclick` conflicts with tooltip and thus must be disabled -->

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
	seriesLayout="group"
	padding={defaultChartPadding({ left: 24 })}
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	tooltipContext={false}
	onBarClick={(e, detail) => {
		console.log(e, detail);
		alert(JSON.stringify(detail));
	}}
	height={300}
/>
