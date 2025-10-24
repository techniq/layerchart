<script lang="ts">
	import { BarChart, Tooltip } from 'layerchart';
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

<BarChart
	{data}
	x="date"
	y="value"
	axis={false}
	grid={false}
	bandPadding={0.1}
	props={{ bars: { radius: 1, strokeWidth: 0 } }}
	width={124}
	height={18}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root
			{context}
			class="text-xs"
			contained={false}
			variant="none"
			y={-10}
			x={context.width + 8}
		>
			{#snippet children({ data })}
				<div class="whitespace-nowrap">
					{format(data.date, 'day')}
				</div>
				<div class="font-semibold">
					{data.value}
				</div>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
