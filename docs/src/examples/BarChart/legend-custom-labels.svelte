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
		{ key: 'apples', color: 'var(--color-danger)', label: 'Red Apples' },
		{
			key: 'bananas',
			color: 'var(--color-warning)',
			label: 'Yellow Bananas'
		},
		{
			key: 'cherries',
			color: 'var(--color-success)',
			label: 'Sweet Cherries'
		},
		{
			key: 'grapes',
			color: 'var(--color-info)',
			label: 'Purple Grapes'
		}
	]}
	seriesLayout="group"
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	legend
	height={300}
/>
