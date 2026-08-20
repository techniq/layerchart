<script lang="ts">
	import { Axis, Chart, Highlight, Labels, Layer, Spline, Tooltip, pivotLonger } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys
	});
	const data = pivotLonger(multiSeriesData, keys, 'fruit', 'value');

	const fruitColors = {
		apples: 'var(--color-apples)',
		bananas: 'var(--color-bananas)',
		oranges: 'var(--color-oranges)'
	};

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	c="fruit"
	cDomain={Object.keys(fruitColors)}
	cRange={Object.values(fruitColors)}
	tooltipContext={{ mode: 'quadtree' }}
	padding={25}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Spline stroke="fruit" class="stroke-2" />
		<Labels format="integer" />
		<Highlight points lines />
	</Layer>
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label={data.fruit} value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
