<script module lang="ts">
	import { getWorldLandPoints } from '$lib/geo.remote.js';
	const landPoints = await getWorldLandPoints();
</script>

<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { Chart, Circle, Layer } from 'layerchart';
	import { GeoBin, GeoPath } from 'layerchart/geo';
	import { RangeField } from 'svelte-ux';

	export { landPoints as data };

	// Pixels between dots — closer for more of them
	let spacing = $state(8);
</script>

<div class="mb-4">
	<RangeField label="Spacing" bind:value={spacing} min={3} max={20} step={1} />
</div>

<!-- A dot at the center of each cell with land in it, all drawn by one `Circle` -->
<Chart
	data={landPoints}
	x={(d) => d[0]}
	y={(d) => d[1]}
	geo={{
		projection: geoOrthographic,
		fitGeojson: { type: 'Sphere' },
		rotate: { yaw: -20, pitch: -30, roll: 0 }
	}}
	transform={{ mode: 'projection' }}
	padding={8}
	height={600}
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-100 stroke-surface-content/20" />
		<GeoBin size={spacing}>
			{#snippet children({ cells })}
				<Circle
					data={cells}
					cx={(cell) => cell.center![0]}
					cy={(cell) => cell.center![1]}
					r={spacing * 0.3}
					class="fill-surface-content"
				/>
			{/snippet}
		</GeoBin>
	</Layer>
</Chart>
