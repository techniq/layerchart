<script lang="ts">
	import { Axis, Cell, Chart, Grid, isometric, Layer } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { range } from 'd3-array';
	import { timeWeek, timeYear } from 'd3-time';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 140, min: 0, max: 100, value: 'integer' });
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
	z="value"
	c="value"
	cDomain={[25, 50, 75]}
	cRange={[
		'var(--color-primary-100)',
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)'
	]}
	view={isometric}
	padding={{ left: 32, bottom: 20, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Grid x y bandAlign="between" />
		<Axis placement="bottom" format={(d) => 'W' + d} tickLabelProps={{ viewport: true }} />
		<Axis placement="left" format={(d) => daysOfWeek[d]} tickLabelProps={{ viewport: true }} />
		<Cell
			x={(d) => timeWeek.count(timeYear(d.date), d.date)}
			y={(d) => d.date.getDay()}
			fill="value"
			insets={{ all: 1 }}
		/>
	</Layer>
</Chart>
