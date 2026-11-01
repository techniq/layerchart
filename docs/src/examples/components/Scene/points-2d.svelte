<script lang="ts">
	import { Axis, Chart, Grid, Points, Scene } from '@layerchart/3d';
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';

	// Seeded, so the points are the same on every load
	let seed = 7;
	function random() {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	}
	/** Normally distributed, about 0 */
	function normal() {
		return Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
	}

	// 100,000 points in eight clusters
	const centers = Array.from({ length: 8 }, () => ({
		x: random() * 80 + 10,
		y: random() * 80 + 10
	}));
	const data = Array.from({ length: 100_000 }, (_, i) => {
		const cluster = i % centers.length;
		const { x, y } = centers[cluster];
		const spread = 4 + (cluster % 3) * 3;
		return { x: x + normal() * spread, y: y + normal() * spread, cluster };
	});

	export { data };
</script>

<!-- No `view`: drawn flat, from directly above, as a fast 2D layer.  Shift-scroll to zoom, drag to pan -->
<Chart
	transform={{ mode: 'canvas', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x="x"
	y="y"
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	c="cluster"
	cScale={scaleOrdinal()}
	cRange={schemeTableau10}
	padding={{ left: 32, bottom: 24, right: 8, top: 8 }}
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene>
		<Grid />
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Points r={1.5} opacity={0.6} />
	</Scene>
</Chart>
