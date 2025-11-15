<script lang="ts">
	import { LineChart, Tooltip } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 50, min: 50, max: 100 });
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	yDomain={null}
	axis={false}
	grid={false}
	props={{
		highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
	}}
	padding={{ left: 20 }}
	width={124}
	height={24}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root
			{context}
			class="text-xs"
			contained={false}
			y={-3}
			x={context.width + 35}
			variant="none"
		>
			{#snippet children({ data })}
				<div class="whitespace-nowrap">
					{format(data.date, 'day')}
				</div>
				<div class="font-semibold">
					{format(data.value, 'decimal', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
				</div>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
