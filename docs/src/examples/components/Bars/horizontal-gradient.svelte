<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bars, Axis, Chart, Layer, LinearGradient } from 'layerchart';
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
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<LinearGradient class="from-green-400 to-blue-500" units="userSpaceOnUse">
			{#snippet children({ gradient })}
				<Bars strokeWidth={1} fill={gradient} class="stroke-blue-900" />
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>
