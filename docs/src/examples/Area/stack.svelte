<script lang="ts">
	import { stack, type Series } from 'd3-shape';
	import { Area, Axis, Chart, Highlight, Layer, Tooltip, asAny } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';
	import flatten from '$lib/utils/flatten.js';

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys
	});

	type B = Series<
		{
			date: number;
		},
		string
	>[];

	const stackData = stack().keys(keys)(multiSeriesData) as B;

	const fruitColors = {
		apples: 'var(--color-danger)',
		bananas: 'var(--color-success)',
		oranges: 'var(--color-info)'
	};

	export { stackData as data };
</script>

<Chart
	data={stackData}
	flatData={flatten(stackData)}
	x={(d) => asAny(d).data.date}
	y={[0, 1]}
	yNice
	c="key"
	cDomain={Object.keys(fruitColors)}
	cRange={Object.values(fruitColors)}
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />

			{#each stackData as seriesData}
				{@const color = context.cGet(seriesData)}
				<Area
					data={seriesData}
					line={{ stroke: color, 'stroke-width': 2 }}
					fill={color}
					fillOpacity={0.2}
				/>
			{/each}

			<Highlight points lines />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					{#each keys as key}
						<Tooltip.Item label={key} value={data.data[key]} color={context.cScale?.(key)} />
					{/each}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
