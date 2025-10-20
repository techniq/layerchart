<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bars, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24, top: 16 }}
	tooltip={{ mode: 'band' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Bars radius={4} strokeWidth={1} class="fill-primary" />
			<Highlight area />
		</Layer>

		<Tooltip.Root
			x="data"
			y="data"
			yOffset={2}
			anchor="bottom"
			contained={false}
			variant="none"
			class="text-[10px] font-semibold text-primary bg-surface-100 px-2 py-[2px] border border-primary rounded-sm whitespace-nowrap"
		>
			{#snippet children({ data })}
				{data.value}
			{/snippet}
		</Tooltip.Root>

		<Tooltip.Root
			x="data"
			y={context.height + context.padding.top + 2}
			anchor="top"
			contained={false}
			variant="none"
			class="text-[10px] font-semibold text-primary bg-surface-100 px-2 py-[2px] border border-primary rounded-sm whitespace-nowrap"
		>
			{#snippet children({ data })}
				{format(data.date, 'day')}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
