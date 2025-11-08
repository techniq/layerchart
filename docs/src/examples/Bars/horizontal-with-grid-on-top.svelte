<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bars, Axis, Chart, Layer } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<Chart
	{data}
	x="value"
	xDomain={[0, null]}
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 32, bottom: 20, right: 8 }}
	height={300}
>
	<Layer>
		<Bars strokeWidth={1} class="fill-primary" />
		<Axis placement="bottom" grid={{ class: 'stroke-surface-100' }} rule />
		<Axis placement="left" rule />
	</Layer>
</Chart>
