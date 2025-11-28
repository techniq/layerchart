<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Bars, Chart, Layer } from 'layerchart';
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
	yDomain={[0, null]}
	yNice
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Bars>
			{#each data as d, i}
				<Bar
					data={d}
					strokeWidth={1}
					class={i === data.length - 4 ? 'fill-primary' : 'fill-surface-content'}
				/>
			{/each}
		</Bars>
	</Layer>
</Chart>
