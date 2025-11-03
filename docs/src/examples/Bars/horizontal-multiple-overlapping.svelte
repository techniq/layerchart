<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';
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

<Chart
	{data}
	x={['value', 'baseline']}
	xDomain={[0, null]}
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 32, bottom: 20, right: 8 }}
	tooltip={{ mode: 'band' }}
	height={500}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<Bars x="baseline" strokeWidth={1} class="fill-surface-content/20" />
		<Bars x="value" strokeWidth={1} insets={{ y: 8 }} class="fill-primary" />
		<Highlight area />
	</Layer>
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
				<Tooltip.Item label="baseline" value={data.baseline} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
