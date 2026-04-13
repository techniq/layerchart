<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, GeoRaster, Graticule, Layer } from 'layerchart';
	const countries = feature(topology, topology.objects.countries);

	// NASA Blue Marble — equirectangular / plate carrée. Served locally from
	// `static/images/` to avoid CORS issues when reading pixel data.
	const imageUrl = '/images/blue-marble.jpg';

	const data = { topology, countries };
	export { data };
</script>

<Chart
	geo={{
		projection: geoOrthographic,
		fitGeojson: { type: 'Sphere' }
	}}
	transform={{
		mode: 'projection',
		constrain: ({ scale, translate }) => ({
			scale,
			translate: {
				x: translate.x,
				y: Math.max(-90, Math.min(90, translate.y))
			}
		})
	}}
	padding={{ top: 5, bottom: 5, left: 5, right: 5 }}
	height={500}
>
	<Layer type="canvas">
		<GeoRaster image={imageUrl} interpolate="bilinear" />
	</Layer>
	<Layer type="svg">
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-none stroke-surface-content/40" />
		<Graticule class="stroke-surface-content/15" />
		{#each countries.features as feature}
			<GeoPath geojson={feature} class="fill-none stroke-surface-content/40" />
		{/each}
	</Layer>
</Chart>
