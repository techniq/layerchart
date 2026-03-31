<script lang="ts">
	import { BarChart, pivotLonger } from 'layerchart';
	import { wideData } from '$lib/utils/data.js';
	import { group } from 'd3-array';

	const keys = ['apples', 'bananas', 'cherries', 'grapes'];
	const flatData = pivotLonger(wideData, keys, 'fruit', 'value');
	const dataByFruit = group(flatData, (d) => d.fruit);
	export { dataByFruit as data };
</script>

<BarChart
	x="year"
	y="value"
	series={[
		{
			key: 'apples',
			data: dataByFruit.get('apples'),
			color: 'var(--color-apples)'
		},
		{
			key: 'bananas',
			data: dataByFruit.get('bananas'),
			color: 'var(--color-bananas)'
		},
		{
			key: 'cherries',
			data: dataByFruit.get('cherries'),
			color: 'var(--color-cherries)'
		},
		{
			key: 'grapes',
			data: dataByFruit.get('grapes'),
			color: 'var(--color-grapes)'
		}
	]}
	seriesLayout="stack"
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	height={300}
/>
