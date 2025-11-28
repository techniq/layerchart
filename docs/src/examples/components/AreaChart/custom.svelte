<script lang="ts">
	import { Area, AreaChart, Axis, Highlight, Layer, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<AreaChart {data} x="date" y="value" height={300}>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Area line={{ class: 'stroke-primary' }} class="fill-primary/30" />
			<Highlight points lines />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{format(context.x(data), 'day')}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={context.y(data)} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</AreaChart>
