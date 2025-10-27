<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';
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
	tooltip={{
		mode: 'band',
		onclick(e, { data }) {
			alert('You clicked on:\n' + JSON.stringify(data, null, 2));
		}
	}}
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<Bars strokeWidth={1} class="fill-primary" />
		<Highlight area />
	</Layer>
</Chart>
