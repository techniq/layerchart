<script lang="ts">
	import { BarChart } from 'layerchart';
	import { longData } from '$lib/utils/data.js';
	import { group } from 'd3-array';

	const dataByFruit = group(longData, (d) => d.fruit);
	const data = dataByFruit;

	export { data };
</script>

<BarChart
	x="year"
	y="value"
	series={[
		{ key: 'apples', data: dataByFruit.get('apples'), color: 'var(--color-danger)' },
		{
			key: 'bananas',
			data: dataByFruit.get('bananas'),
			color: 'var(--color-warning)'
		},
		{
			key: 'cherries',
			data: dataByFruit.get('cherries'),
			color: 'var(--color-success)'
		},
		{
			key: 'grapes',
			data: dataByFruit.get('grapes'),
			color: 'var(--color-info)'
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
	height={300}
/>
