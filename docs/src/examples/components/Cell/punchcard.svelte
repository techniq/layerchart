<script lang="ts">
	import { Chart, Cell, Axis, Grid, Layer } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { range } from 'd3-array';
	import { timeWeek, timeYear } from 'd3-time';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	export { data };
</script>

<Chart
	{data}
	x={(d) => timeWeek.count(timeYear(d.date), d.date)}
	xScale={scaleBand()}
	y={(d) => d.date.getDay()}
	yScale={scaleBand()}
	yDomain={range(7)}
	r="value"
	rRange={[0, 16]}
	padding={{ left: 32, bottom: 16 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" format={(d) => 'Week\u00A0' + d} rule />
		<!-- \u00A0 is a non-breaking space, only necessart for HTML -->
		<Axis placement="left" format={(d) => daysOfWeek[d]} rule />
		<Grid x={false} y bandAlign="between" />
		<Cell
			x={(d) => timeWeek.count(timeYear(d.date), d.date)}
			y={(d) => d.date.getDay()}
			shape="circle"
			r="value"
			fill="var(--color-primary)"
		/>
	</Layer>
</Chart>
