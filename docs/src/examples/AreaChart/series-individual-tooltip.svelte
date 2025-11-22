<script lang="ts">
	import { Area, AreaChart, Highlight, Tooltip, pivotLonger } from 'layerchart';
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

<AreaChart
	x="date"
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
			key: 'oranges',
			data: dataByFruit.get('oranges'),
			color: 'var(--color-oranges)'
		}
	]}
	props={{ tooltip: { context: { mode: 'quadtree' } } }}
	height={300}
>
	{#snippet marks({ series, context })}
		{#each series as s}
			{@const activeSeries =
				context.tooltip?.data == null || context.tooltip?.data?.fruit === s.key}

			<g class={cls(!activeSeries && 'opacity-20 saturate-0')}>
				<Area data={s.data} line={{ stroke: s.color }} fill={s.color} fillOpacity={0.3} />
			</g>
		{/each}
	{/snippet}

	{#snippet highlight({ series, context })}
		{@const activeSeries = series.find((s) => s.key === context.tooltip?.data?.fruit)}
		<Highlight lines points={{ fill: activeSeries?.color }} />
	{/snippet}

	{#snippet tooltip({ series, context })}
		{@const activeSeries = series.find((s) => s.key === context.tooltip?.data?.fruit)}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label={data?.fruit} value={data?.value} color={activeSeries?.color} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</AreaChart>
