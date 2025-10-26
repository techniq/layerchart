<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Labels, Layer, Rule } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });
	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yBaseline={0}
	yNice
	yPadding={[16, 16]}
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Rule y={0} />
		<Bars strokeWidth={1} class="fill-primary" />
		<Labels format="integer" />
	</Layer>
</Chart>
