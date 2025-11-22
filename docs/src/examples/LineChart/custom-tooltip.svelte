<script lang="ts">
	import { LineChart, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<LineChart {data} x="date" y="value" height={300}>
	{#snippet tooltip({ context })}
		<Tooltip.Root
			x={context.padding.left}
			y="data"
			anchor="right"
			contained={false}
			variant="none"
			class="text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-1 py-[2px] border border-primary rounded-sm whitespace-nowrap"
		>
			{#snippet children({ data })}
				{context.y(data)}
			{/snippet}
		</Tooltip.Root>

		<Tooltip.Root
			x="data"
			y={context.height}
			anchor="top"
			contained={false}
			variant="none"
			class="text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-2 py-[2px] border border-primary rounded-sm whitespace-nowrap"
		>
			{#snippet children({ data })}
				{format(context.x(data), 'day')}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
