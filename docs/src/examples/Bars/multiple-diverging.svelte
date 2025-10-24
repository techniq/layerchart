<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Rule, Tooltip } from 'layerchart';
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
	x={['value', (d) => -d.baseline]}
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'band' }}
	height={500}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" />
		<Bars x="value" rounded="right" strokeWidth={1} class="fill-primary" />
		<Bars x={(d) => -d.baseline} rounded="left" strokeWidth={1} class="fill-secondary" />
		<Rule x={0} />

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
