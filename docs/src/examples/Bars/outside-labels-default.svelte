<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Highlight, Labels, Layer, Rule, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ min: -20, max: 50, value: 'integer' });

	export { data };
</script>

<Chart
	{data}
	x="value"
	xNice
	xPadding={[20, 20]}
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<Rule x={0} />
		<Bars strokeWidth={1} class="fill-primary" />
		<Labels format="integer" />
	</Layer>
</Chart>
