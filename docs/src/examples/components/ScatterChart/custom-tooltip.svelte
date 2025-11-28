<script lang="ts">
	import { ScatterChart, Tooltip } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
	export { data };
</script>

<ScatterChart {data} x="x" y="y" padding={24} height={400}>
	{#snippet tooltip({ context })}
		<Tooltip.Root
			x={context.padding.left}
			y="data"
			anchor="right"
			contained={false}
			variant="none"
			class="text-[10px] font-semibold text-primary bg-surface-100 mr-[2px] px-1 py-[2px] border border-primary rounded-sm whitespace-nowrap"
		>
			{#snippet children({ data })}
				{format(context.y(data), 'integer')}
			{/snippet}
		</Tooltip.Root>

		<Tooltip.Root
			x="data"
			y={context.height}
			anchor="top"
			class="text-[10px] font-semibold text-primary bg-surface-100 mt-[1px] px-2 py-[1px] border border-primary rounded-sm whitespace-nowrap"
			variant="none"
			contained={false}
		>
			{#snippet children({ data })}
				{format(context.x(data), 'integer')}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</ScatterChart>
