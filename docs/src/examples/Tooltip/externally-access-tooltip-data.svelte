<script lang="ts">
	import { Area, Axis, Chart, Layer, Highlight, Tooltip, type ChartContextValue } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let context: ChartContextValue<(typeof data)[number]> | undefined = $state();

	export { data };
</script>

<div class="text-sm mb-4">
	{#if context}
		{#if context.tooltip.data}
			date: {format(context.tooltip.data.date, 'day', { variant: 'short' })}
			value: {context.tooltip.data.value}
		{:else}
			[hover chart]
		{/if}
	{/if}
</div>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'quadtree-x' }}
	bind:context
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
		<Highlight points lines />
	</Layer>
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
