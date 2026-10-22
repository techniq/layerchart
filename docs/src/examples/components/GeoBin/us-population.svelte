<script module lang="ts">
	import { getUsPopulationGrid, getUsStatesTopology } from '$lib/geo.remote.js';
	const grid = await getUsPopulationGrid();
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import { max } from 'd3-array';
	import { geoAlbers } from 'd3-geo';
	import { scaleSequentialLog } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';
	import { feature, mesh } from 'topojson-client';

	import { Chart, Layer, Legend } from 'layerchart';
	import { GeoBin, GeoPath } from 'layerchart/geo';

	// Cells with at least 100 people
	const cells = grid.filter((d) => d[2] >= 100);

	// The contiguous states, which the grid covers
	const outside = new Set(['02', '15', '60', '66', '69', '72', '78']);
	const states = {
		type: 'FeatureCollection' as const,
		features: feature(topology, topology.objects.states).features.filter(
			(f) => !outside.has(String(f.id))
		)
	};
	const borders = mesh(
		topology,
		topology.objects.states,
		(a, b) => a !== b && !outside.has(String(a.id)) && !outside.has(String(b.id))
	);

	export { cells as data };
</script>

<!-- 2020's population of each 15′ cell, drawn as the cell itself: a square of the graticule, which
     the projection bends -->
<Chart
	data={cells}
	x={(d) => d[0]}
	y={(d) => d[1]}
	cScale={scaleSequentialLog((t) => interpolateViridis(1 - t))}
	cDomain={[100, max(cells, (d) => d[2])!]}
	geo={{ projection: geoAlbers, fitGeojson: states }}
	padding={{ top: 56 }}
	height={560}
>
	<Legend
		title="Population (2020)"
		placement="top-left"
		tickValues={[100, 1e3, 1e4, 1e5, 1e6]}
		tickFormat="metric"
	/>
	<Layer>
		<GeoPath geojson={borders} class="fill-none stroke-surface-content/30" strokeWidth={0.5} />
		<!-- 15′ squares, one to each of the grid's cells, counting its people -->
		<GeoBin shape="square" step={0.25} weight={(d) => d[2]} fill="count" />
		<GeoPath geojson={states} class="fill-none stroke-surface-content/20" />
	</Layer>
</Chart>
