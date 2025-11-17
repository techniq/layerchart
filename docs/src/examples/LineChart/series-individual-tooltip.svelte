<script lang="ts">
	import { LineChart, Highlight, pivotLonger, Spline, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { group } from 'd3-array';
	import { cls } from '@layerstack/tailwind';
	import { format } from '@layerstack/utils';

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
	data={flatData}
	x="date"
	y="value"
	series={[
		{ key: 'apples', color: 'var(--color-danger)' },
		{ key: 'bananas', color: 'var(--color-success)' },
		{ key: 'oranges', color: 'var(--color-warning)' }
	]}
	props={{ tooltip: { context: { mode: 'quadtree' } } }}
	brush
	legend
	padding={{ left: 20, top: 20, right: 20, bottom: 50 }}
	height={300}
>
	{#snippet marks({ context, visibleSeries, highlightKey })}
		{#each visibleSeries as s}
			{@const active =
				(context.tooltip.data == null || s.key === context.tooltip.data?.fruit) &&
				(highlightKey === null || s.key === highlightKey)}
			<Spline {data} y={s.key} stroke={s.color} class={cls(!active && 'opacity-20 saturate-0')} />
		{/each}
	{/snippet}

	{#snippet highlight({ series, context })}
		{@const activeSeriesColor = series.find((s) => s.key === context.tooltip.data?.fruit)?.color}
		<Highlight lines points={{ fill: activeSeriesColor }} />
	{/snippet}

	{#snippet tooltip({ context, series })}
		{@const activeSeriesColor = series.find((s) => s.key === context.tooltip.data?.fruit)?.color}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label={data.fruit} value={data.value} color={activeSeriesColor} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
