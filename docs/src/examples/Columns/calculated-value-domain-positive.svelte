<script lang="ts">
	import { scaleBand } from 'd3-scale';
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
	yDomain={[0, null]}
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" />
	<Bars rounded="top" strokeWidth={1} class="fill-primary" />
</Chart>
