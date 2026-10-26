<script module lang="ts">
	import { getWorldLandPoints } from '$lib/geo.remote.js';
	const landPoints = await getWorldLandPoints();
</script>

<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { type BinShape, Chart, Layer } from 'layerchart';
	import { GeoBin, GeoPath } from 'layerchart/geo';
	import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

	export { landPoints as data };

	let shape = $state<BinShape>('hexagon');
	let size = $state(12);
	let showGrid = $state(true);
</script>

<div class="grid grid-cols-[auto_1fr_auto] gap-2 mb-4">
	<Field label="Shape">
		<ToggleGroup bind:value={shape} variant="outline">
			<ToggleOption value="hexagon">Hexagon</ToggleOption>
			<ToggleOption value="square">Square</ToggleOption>
			<ToggleOption value="triangle">Triangle</ToggleOption>
		</ToggleGroup>
	</Field>
	<RangeField label="Size" bind:value={size} min={6} max={60} step={1} />
	<Field label="Grid" let:id>
		<Switch {id} bind:checked={showGrid} />
	</Field>
</div>

<!-- Points spread evenly over the land, so every cell with land in it fills -->
<Chart
	data={landPoints}
	x={(d) => d[0]}
	y={(d) => d[1]}
	geo={{ projection: geoOrthographic, fitGeojson: { type: 'Sphere' } }}
	transform={{ mode: 'projection' }}
	padding={8}
	height={600}
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-200 stroke-surface-content/20" />
		<!-- Stroked in the fill, so neighboring cells meet without a hairline between them -->
		<GeoBin
			{shape}
			{size}
			fill="var(--color-surface-content)"
			stroke="var(--color-surface-content)"
			grid={showGrid}
		/>
	</Layer>
</Chart>
