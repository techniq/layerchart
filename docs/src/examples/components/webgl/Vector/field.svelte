<script lang="ts">
	import { Axis, Chart, Grid, Tooltip, Vector, WebGL, perspective } from '@layerchart/webgl';
	import { scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';

	// A field swirling about the middle and rising, sampled on a 7 × 7 × 7 grid
	const steps = [-3, -2, -1, 0, 1, 2, 3];
	const data = steps.flatMap((x) =>
		steps.flatMap((y) =>
			steps.map((z) => {
				const u = -y;
				const v = x;
				const w = 1.5 + z / 3;
				return {
					x,
					y,
					z,
					u,
					v,
					w,
					magnitude: Math.hypot(u, v, w),
					// Clockwise from up the plot (`+y`), and up out of the floor
					direction: (Math.atan2(u, v) * 180) / Math.PI,
					tilt: (Math.atan2(w, Math.hypot(u, v)) * 180) / Math.PI
				};
			})
		)
	);

	export { data };
</script>

<!-- Each arrow at its point in the box, pointing the field's way, longer and warmer where it's stronger -->
<Chart
	{data}
	x="x"
	y="y"
	z="z"
	xDomain={[-3.5, 3.5]}
	yDomain={[-3.5, 3.5]}
	zDomain={[-3.5, 3.5]}
	zRange={({ height }) => [0, height]}
	r="magnitude"
	rRange={[10, 34]}
	c="magnitude"
	cScale={scaleSequential(interpolateTurbo)}
	view={perspective({ rotate: -30, tilt: 65 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	tooltipContext
	padding={40}
	height={550}
>
	<WebGL>
		<Grid />
		<Axis placement="bottom" label="x" />
		<Axis placement="left" label="y" />
		<Axis placement="back" label="z" />
		<Vector
			x="x"
			y="y"
			z="z"
			length="magnitude"
			rotate="direction"
			tilt="tilt"
			shape="arrow-filled"
			tooltip
		/>
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header>({data.x}, {data.y}, {data.z})</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="u" value={data.u} format="decimal" />
				<Tooltip.Item label="v" value={data.v} format="decimal" />
				<Tooltip.Item label="w" value={data.w} format="decimal" />
				<Tooltip.Item label="magnitude" value={data.magnitude} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
