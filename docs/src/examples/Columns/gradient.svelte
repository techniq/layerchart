<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Bars, Chart, Highlight, Layer, LinearGradient, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
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
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<LinearGradient class="from-blue-500 to-green-400" vertical units="userSpaceOnUse">
			{#snippet children({ gradient })}
				<Bars strokeWidth={1} fill={gradient} class="stroke-blue-900" />
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>
