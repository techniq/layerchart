<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Highlight, Layer, Pattern } from 'layerchart';
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
