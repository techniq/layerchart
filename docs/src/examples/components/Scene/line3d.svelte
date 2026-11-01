<script lang="ts">
	import { Axis, Chart, Grid, Scene, Spline } from '@layerchart/3d';
	import { scaleSequential } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';

	// A toroidal spiral: a wire wound 75 times around a circle while it climbs
	const data = Array.from({ length: 25_000 }, (_, i) => {
		const t = i / 1000;
		const r = 1 + 0.25 * Math.cos(75 * t);
		return { x: r * Math.cos(t), y: r * Math.sin(t), z: t + 2 * Math.sin(75 * t) };
	});

	export { data };
</script>

<Chart
	{data}
	x="x"
	y="y"
	z="z"
	zRange={({ height }) => [0, height]}
	c="z"
	cScale={scaleSequential(interpolateViridis)}
	height={550}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene camera="orthographic" rotate={-30} tilt={70} scrollActivationKey="shift">
		<Grid />
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Axis placement="back" />
		<!-- Colored along its length by height -->
		<Spline strokeWidth={1.5} />
	</Scene>
</Chart>
