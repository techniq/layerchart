<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bars, Axis, Chart, Labels, Layer, Rule } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ min: -20, max: 50, value: 'integer' });

	export { data };
</script>

<Chart
	{data}
	x="value"
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 32, bottom: 20, right: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<Rule x={0} />
		<Bars strokeWidth={1} class="fill-primary" />
		<Labels placement="inside" format="integer" />
	</Layer>
</Chart>
