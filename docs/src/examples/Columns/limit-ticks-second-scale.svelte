<script lang="ts">
	import { scaleBand, scaleTime } from 'd3-scale';
	import { Axis, Bars, Chart, Layer } from 'layerchart';
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
	yNice
	padding={{ left: 16, bottom: 24 }}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis
			placement="bottom"
			ticks={(scale) => scaleTime(scale.domain(), scale.range()).ticks(4)}
			rule
		/>
		<Bars strokeWidth={1} class="fill-primary" />
	</Layer>
</Chart>
