<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { timeDay } from 'd3-time';
	import { Axis, Bars, Chart, Layer } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 20, min: 20, max: 100 });
	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleTime()}
	xInterval={timeDay}
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 24, bottom: 28, top: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule tickMultiline />
		<Bars strokeWidth={1} class="fill-primary" />
	</Layer>
</Chart>
