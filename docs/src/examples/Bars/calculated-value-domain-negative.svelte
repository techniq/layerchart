<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 10, min: -100, max: -50 });

	export { data };
</script>

<Chart
	{data}
	x="value"
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 20, bottom: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<Bars strokeWidth={1} class="fill-primary" />
	</Layer>
</Chart>
