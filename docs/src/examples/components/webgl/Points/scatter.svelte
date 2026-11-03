<script lang="ts">
	import { Axis, Chart, Grid, Legend, Points, Tooltip, WebGL } from '@layerchart/webgl';
	import { Highlight, Svg } from 'layerchart';
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
		return {
			x: x + normal() * spread,
			y: y + normal() * spread,
			cluster: `Cluster ${cluster + 1}`
		};
	});

	export { data };
</script>

<!--
	No `view`: drawn flat, from directly above, as a fast 2D layer, grid and axes included.
	Shift-scroll to zoom and drag to pan: the domain zooms, so the axes stay at the plot's edges and
	re-tick.  The chart's tooltip finds the nearest point, and `Highlight` marks it over the scene.
-->
<Chart
	transform={{ mode: 'domain', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x="x"
	y="y"
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	c="cluster"
	cScale={scaleOrdinal()}
	cRange={schemeTableau10}
	tooltipContext={{ mode: 'quadtree' }}
	padding={{ left: 32, bottom: 24, right: 8, top: 32 }}
	height={500}
>
	<WebGL>
		<Grid />
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Points r={1.5} opacity={0.6} />
	</WebGL>

	<Svg>
		<Highlight points lines axis="both" />
	</Svg>

	<Legend placement="top" />

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header>{data.cluster}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="x" value={data.x} format="decimal" />
				<Tooltip.Item label="y" value={data.y} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
