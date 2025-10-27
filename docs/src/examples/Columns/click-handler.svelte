<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Bars, Chart, Highlight, Layer, Tooltip } from 'layerchart';
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
	tooltip={{
		mode: 'band',
		onclick(e, { data }) {
			alert('You clicked on:\n' + JSON.stringify(data, null, 2));
		}
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Bars strokeWidth={1} class="fill-primary" />
		<Highlight area />
	</Layer>
</Chart>
