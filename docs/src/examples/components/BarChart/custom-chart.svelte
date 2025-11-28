<script lang="ts">
	import { BarChart, Tooltip, Layer, Axis, Bars, Highlight } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { createDateSeries } from '$lib/utils/data.js';

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
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Bars radius={4} strokeWidth={1} class="fill-primary" />
			<Highlight area />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={context.y(data)} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
