<script lang="ts">
	import { Axis, Chart, Grid, WebGL, Spline, perspective } from '@layerchart/webgl';
	import { scaleBand, scaleOrdinal } from 'd3-scale';

	const keys = ['apples', 'bananas', 'cherries', 'dates'];

	// One wave per fruit, each a little out of phase with the last
	const data = keys.flatMap((fruit, i) =>
		Array.from({ length: 100 }, (_, t) => ({
			fruit,
			t,
			value: 50 + Math.sin(t / 8 + i) * 30 + Math.sin(t / 3 + i * 2) * 10
		}))
	);

	export { data };
</script>

<Chart
	view={perspective({ rotate: -30, tilt: 65 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x="t"
	y="fruit"
	yScale={scaleBand()}
	yDomain={keys}
	z="value"
	zDomain={[0, 100]}
	c="fruit"
	cScale={scaleOrdinal()}
	cDomain={keys}
	cRange={[
		'var(--color-danger)',
		'var(--color-warning)',
		'var(--color-success)',
		'var(--color-info)'
	]}
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		<Grid y={false} />
		<Axis placement="bottom" label="time" />
		<Axis placement="left" />
		<Axis placement="back" />
		<Spline strokeWidth={3} />
	</WebGL>
</Chart>
