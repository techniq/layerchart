<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value']
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yScale={scaleLinear()}
	yNice
	padding={{ left: 16, bottom: 24, right: 40 }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" tickCount={3} />
	<Axis placement="right" format="integer" tickCount={2} />
	<Axis placement="bottom" />
	<Bars rounded="top" strokeWidth={1} class="fill-primary" />
</Chart>
