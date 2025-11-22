<script lang="ts">
	import { Axis, Highlight, Layer, Points, ScatterChart, Tooltip } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
	export { data };
</script>

<ScatterChart {data} x="x" y="y" padding={24} height={400}>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" grid rule />
			<Points class="fill-primary/10 stroke-primary" />
			<Highlight points lines axis="both" />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{format(context.x(data), 'integer')}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={format(context.y(data), 'integer')} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</ScatterChart>
