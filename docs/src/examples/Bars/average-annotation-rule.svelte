<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { mean } from 'd3-array';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Rule, Text, Tooltip } from 'layerchart';
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
	x="value"
	xDomain={[0, null]}
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 20, bottom: 20 }}
	height={300}
>
	{#snippet children({ context })}
		{@const avg = mean(data, (d) => d.value)}
		<Layer>
			<Axis placement="bottom" grid rule />
			<Axis placement="left" rule />
			<Bars strokeWidth={1} class="fill-primary" />
			<Rule x={avg} class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] " />
			<Text
				x={context.xScale(avg)}
				y={0}
				dx={-4}
				value="Avg"
				textAnchor="end"
				verticalAnchor="start"
				class="text-sm fill-danger stroke-surface-100 stroke-2"
			/>
		</Layer>
	{/snippet}
</Chart>
