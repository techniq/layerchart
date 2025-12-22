<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Highlight, Layer, Pattern } from 'layerchart';
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
		<Pattern
			size={8}
			lines={{ rotate: -45, color: 'var(--color-secondary)', opacity: 0.3 }}
			background="color-mix(in oklab, var(--color-secondary) 10%, transparent)"
		>
			{#snippet children({ pattern })}
				<Highlight data={data[3]} area={{ fill: pattern, class: 'stroke-secondary/50' }} />
			{/snippet}
		</Pattern>
		<Bars strokeWidth={1} class="fill-primary" />
	</Layer>
</Chart>
