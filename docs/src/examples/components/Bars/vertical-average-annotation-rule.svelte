<script lang="ts">
	import { Axis, Bars, Chart, Layer, Rule, Text } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { mean } from 'd3-array';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 20,
		min: 20,
		max: 100
	});
	export { data };

	const avg = mean(data, (d) => d.value);
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Bars strokeWidth={1} class="fill-primary" />
			<Rule y={avg} class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] " />
			<Text
				x={context.width}
				y={context.yScale(avg)}
				dy={-4}
				value="Avg"
				textAnchor="end"
				verticalAnchor="end"
				class="text-sm fill-danger stroke-surface-100 stroke-2"
			/>
		</Layer>
	{/snippet}
</Chart>
