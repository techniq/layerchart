<script lang="ts">
	import { Axis, Chart, Layer, Points, Spline } from 'layerchart';
	import { curveMonotoneX } from 'd3-shape';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, 100]}
	c={(d) => (d.value >= d.baseline ? 'above' : 'below')}
	cDomain={['below', 'above']}
	cRange={['var(--color-danger)', 'var(--color-success)']}
	padding={20}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Spline y="baseline" curve={curveMonotoneX} class="[stroke-dasharray:4] opacity-20" />
		<Points />
	</Layer>
</Chart>
