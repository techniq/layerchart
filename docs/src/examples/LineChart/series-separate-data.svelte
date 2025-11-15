<script lang="ts">
	import { LineChart, pivotLonger } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { group } from 'd3-array';

	const keys = ['apples', 'bananas', 'oranges'];
	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys
	});

	const flatData = pivotLonger(data, keys, 'fruit', 'value');
	const dataByFruit = group(flatData, (d) => d.fruit);

	export { dataByFruit as data };
</script>

<LineChart
	x="date"
	y="value"
	series={[
		{
			key: 'apples',
			data: dataByFruit.get('apples'),
			color: 'var(--color-danger)'
		},
		{
			key: 'bananas',
			data: dataByFruit.get('bananas'),
			color: 'var(--color-success)'
		},
		{
			key: 'oranges',
			data: dataByFruit.get('oranges'),
			color: 'var(--color-warning)'
		}
	]}
	padding={20}
	height={300}
/>
