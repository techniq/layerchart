<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Pattern, Tooltip } from 'layerchart';
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
	padding={{ left: 20, bottom: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<Bars strokeWidth={1} class="fill-primary" />
		<Pattern id="highlight-pattern" width={8} height={8}>
			<rect width={8} height={8} class="fill-secondary/10" />
			<line x1={8} y2={8} class="stroke-secondary/30" />
		</Pattern>
		<Highlight
			data={data[3]}
			area={{ fill: 'url(#highlight-pattern)', class: 'stroke-secondary/50' }}
		/>
	</Layer>
</Chart>
