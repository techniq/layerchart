<script lang="ts">
	import { flatGroup } from 'd3-array';
	import {
		Axis,
		Chart,
		Circle,
		Highlight,
		Layer,
		Spline,
		Text,
		Tooltip,
		pivotLonger
	} from 'layerchart';
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
	const dataByFruit = flatGroup(data, (d) => d.fruit);

	const fruitColors = {
		apples: 'var(--color-info)',
		bananas: 'var(--color-success)',
		oranges: 'var(--color-warning)'
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
	padding={{ top: 25, left: 25, bottom: 25, right: 48 }}
	tooltip={{ mode: 'quadtree' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			{#each dataByFruit as [fruit, data]}
				{@const color = context.cScale?.(fruit)}
				<Spline {data} class="stroke-2" stroke={color}>
					{#snippet endContent()}
						<Circle r={4} fill={color} />
						<Text
							value={fruit}
							verticalAnchor="middle"
							dx={6}
							dy={-2}
							class="text-xs"
							fill={color}
						/>
					{/snippet}
				</Spline>
			{/each}
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
	{/snippet}
</Chart>
