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
			data: dataByFruit.get('apples')?.filter((d, i) => Math.random() > 0.3),
			color: 'var(--color-danger)'
		},
		{
			key: 'bananas',
			data: dataByFruit.get('bananas')?.filter((d, i) => Math.random() > 0.3),
			color: 'var(--color-success)'
		},
		{
			key: 'oranges',
			data: dataByFruit.get('oranges')?.filter((d, i) => Math.random() > 0.3),
			color: 'var(--color-warning)'
		}
	]}
	height={300}
/>
