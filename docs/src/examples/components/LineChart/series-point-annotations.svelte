<script lang="ts">
	import { LineChart, defaultChartPadding, pivotLonger } from 'layerchart';
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

	const series = $derived([
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
	]);
</script>

<LineChart
	x="date"
	y="value"
	{series}
	annotations={series.map((s) => {
		const lastDataPoint = s.data?.[s.data.length - 1] ?? null;
		return {
			type: 'point',
			seriesKey: s.key,
			label: s.key,
			labelPlacement: 'right',
			labelXOffset: 4,
			x: lastDataPoint.date,
			y: lastDataPoint.value,
			props: {
				circle: { fill: s.color },
				label: { fill: s.color }
			}
		};
	})}
	padding={{ ...defaultChartPadding(), right: 60 }}
	height={300}
/>
