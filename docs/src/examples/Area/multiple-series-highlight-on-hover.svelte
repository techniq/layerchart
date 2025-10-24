<script lang="ts">
	import { flatGroup } from 'd3-array';
	import {
		Area,
		Axis,
		Chart,
		Circle,
		Highlight,
		Layer,
		Point,
		Text,
		Tooltip,
		pivotLonger
	} from 'layerchart';
	import { cls } from '@layerstack/tailwind';

	import { createDateSeries } from '$lib/utils/data.js';

	const keys = ['apples', 'bananas', 'oranges'];
	const multiSeriesData = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys
	});

	const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
	const dataByFruit = flatGroup(multiSeriesFlatData, (d) => d.fruit);

	const fruitColors = {
		apples: 'var(--color-danger)',
		bananas: 'var(--color-success)',
		oranges: 'var(--color-info)'
	};

	export { multiSeriesFlatData as data };
</script>

<Chart
	data={multiSeriesFlatData}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	c="fruit"
	cDomain={Object.keys(fruitColors)}
	cRange={Object.values(fruitColors)}
	padding={{ left: 16, bottom: 24, right: 48 }}
	tooltip={{ mode: 'quadtree' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			{#each dataByFruit as [fruit, data]}
				{@const active = context.tooltip.data == null || context.tooltip.data.fruit === fruit}
				{@const color = context.cScale?.(fruit)}
				<g class={cls(!active && 'opacity-20 saturate-0')}>
					<Area {data} fill={color} fillOpacity={0.3} line={{ class: 'stroke-2', stroke: color }} />
					<Point d={data[data.length - 1]}>
						{#snippet children({ x, y })}
							<Circle cx={x} cy={y} r={4} fill={color} />
							<Text
								{x}
								{y}
								value={fruit}
								verticalAnchor="middle"
								dx={6}
								dy={-2}
								class="text-xs"
								fill={color}
							/>
						{/snippet}
					</Point>
				</g>
			{/each}
			<Highlight points lines />
		</Layer>

		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					<Tooltip.Item label={data.fruit} value={data.value} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
