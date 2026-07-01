<script module lang="ts">
	import { getUsStatesTopology } from '$lib/geo.remote.js';
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, Layer, Rect } from 'layerchart';
	import { GeoClipPath, GeoPath, Graticule } from 'layerchart/geo';

	const nation = feature(topology as any, (topology as any).objects.nation);
	const states = feature(topology, topology.objects.states);
</script>

<Chart
	geo={{
		projection: geoAlbersUsa,
		fitGeojson: states
	}}
	height={400}
>
	<Layer>
		<GeoClipPath geojson={nation} invert>
			<Graticule class="stroke-primary/30" />
		</GeoClipPath>

		{#each states.features as feature (feature.id)}
			<GeoPath geojson={feature} class="fill-none stroke-surface-content/20" />
		{/each}

		<GeoPath geojson={nation} class="fill-none stroke-surface-content" />
	</Layer>
</Chart>
