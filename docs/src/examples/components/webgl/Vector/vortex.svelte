<script lang="ts">
	import { Axis, Chart, Grid, Vector, WebGL, perspective } from '@layerchart/webgl';

	// A grid of points, each turning about the center, faster nearer it
	const cols = 30;
	const rows = 20;
	const data = Array.from({ length: cols * rows }, (_, i) => {
		const x = (i % cols) * (100 / cols) + 100 / cols / 2;
		const y = Math.floor(i / cols) * (100 / rows) + 100 / rows / 2;
		const dx = x - 50;
		const dy = y - 50;
		const distance = Math.hypot(dx, dy);
		return {
			x,
			y,
			// Square to the line from the center, so they circle it
			direction: Math.atan2(dx, dy) * (180 / Math.PI) + 90,
			speed: 14 * Math.exp(-distance / 30)
		};
	});

	export { data };
</script>

<!-- LayerChart's data-mode vectors, on the floor of a 3D view.  Drag to turn it -->
<Chart
	padding={40}
	{data}
	x="x"
	y="y"
	r="speed"
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	rDomain={[0, 14]}
	rRange={[2, 16]}
	view={perspective({ tilt: 50 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	height={450}
>
	<WebGL>
		<Grid />
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Vector
			x="x"
			y="y"
			length="speed"
			rotate="direction"
			strokeWidth={1.5}
			class="stroke-primary"
		/>
	</WebGL>
</Chart>
