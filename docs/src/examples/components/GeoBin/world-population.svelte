<script module lang="ts">
	import { getCountriesTopology, getWorldPopulationGrid } from '$lib/geo.remote.js';
	const cells = await getWorldPopulationGrid();
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { scaleThreshold } from 'd3-scale';
	import { schemePuRd } from 'd3-scale-chromatic';
	import { feature } from 'topojson-client';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { type BinShape, Chart, Layer, Legend } from 'layerchart';
	import { GeoBin, GeoPath } from 'layerchart/geo';

	const land = feature(topology, topology.objects.land);

	export { cells as data };

	let shape = $state<BinShape>('hexagon');
	let size = $state(10);
</script>

<div class="grid grid-cols-[auto_1fr] gap-2 mb-4">
	<Field label="Shape">
		<ToggleGroup bind:value={shape} variant="outline">
			<ToggleOption value="hexagon">Hexagon</ToggleOption>
			<ToggleOption value="square">Square</ToggleOption>
			<ToggleOption value="triangle">Triangle</ToggleOption>
		</ToggleGroup>
	</Field>
	<RangeField label="Size" bind:value={size} min={6} max={40} step={1} />
</div>

<!-- People per km², from 2020's population in each 1° cell regridded onto the sphere — fewer than
     10 left clear.  Drag to rotate. -->
<Chart
	data={cells}
	x={(d) => d[0]}
	y={(d) => d[1]}
	cScale={scaleThreshold()}
	cDomain={[10, 25, 50, 100, 250, 500, 1000, 2500]}
	cRange={['transparent', ...schemePuRd[8]]}
	geo={{
		projection: geoOrthographic,
		fitGeojson: { type: 'Sphere' },
		rotate: { yaw: -40, pitch: -20, roll: 0 }
	}}
	transform={{ mode: 'projection' }}
	padding={{ top: 56, bottom: 8, left: 8, right: 8 }}
	height={620}
>
	<Legend title="People per km² (2020)" placement="top-left" />
	<Layer type="canvas">
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-100 stroke-surface-content/20" />
		<GeoPath geojson={land} class="fill-surface-content/10 stroke-none" />
		<!-- A cell's `area` is in steradians on the sphere: × 6371² for km² -->
		<GeoBin
			{shape}
			{size}
			weight={(d) => d[2]}
			fill={(cell) => cell.count / (cell.area * 6371 ** 2)}
		/>
	</Layer>
</Chart>
