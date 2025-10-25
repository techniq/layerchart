<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Text } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 12,
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
	yNice
	padding={{ left: 16, bottom: 24, top: 24 }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" format="day" />
	<Bars rounded="top" strokeWidth={1} class="fill-primary" />
	<Text
		value={(d) => d.value}
		y={(d) => d.value}
		dy={-4}
		textAnchor="middle"
		class="text-xs fill-current"
	/>
</Chart>
