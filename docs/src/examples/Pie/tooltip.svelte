<script lang="ts">
	import { sum } from 'd3-array';
	import { Chart, Layer, Pie, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/genData.js';

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
	const dataSum = $derived(sum(data, (d) => d.value));

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	export { data };
</script>

<Chart {data} x="value" c="date" cRange={keyColors} height={300}>
	{#snippet children({ context })}
		<Layer center>
			<Pie tooltipContext={context.tooltip} />
		</Layer>
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
					<Tooltip.Item
						label="percent"
						value={data.value / dataSum}
						format="percent"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
