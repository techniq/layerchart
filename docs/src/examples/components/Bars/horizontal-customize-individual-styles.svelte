<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Layer } from 'layerchart';
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
		<Bars>
			{#each data as d, i}
				<Bar
					data={d}
					strokeWidth={1}
					class={i === data.length - 1 ? 'fill-primary' : 'fill-surface-content'}
				/>
			{/each}
		</Bars>
	</Layer>
</Chart>
