<script lang="ts">
	import { BarChart, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<BarChart {data} x="date" y="value" height={300}>
	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{format(context.x(data), 'daytime')}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={context.y(data)} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
