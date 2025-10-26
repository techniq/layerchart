<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Bars, Chart, Layer } from 'layerchart';
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
