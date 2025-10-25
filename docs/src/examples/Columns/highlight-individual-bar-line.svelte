<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 12,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value']
	});

	let highlighted = $state(data[5]); // Highlight 6th bar

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yNice
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" format="day" />
	<Bars rounded="top" strokeWidth={1} class="fill-primary" />
	<Highlight line data={highlighted} class="stroke-accent stroke-2" />
</Chart>
