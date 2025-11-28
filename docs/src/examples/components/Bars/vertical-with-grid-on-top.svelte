<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Layer } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 20,
		min: 20,
		max: 100
	});
	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yNice
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
>
	<Layer>
		<Bars strokeWidth={1} class="fill-primary" />
		<Axis placement="left" grid={{ class: 'stroke-surface-100' }} rule />
		<Axis placement="bottom" rule />
	</Layer>
</Chart>
