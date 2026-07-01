<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import {
		geoEqualEarth,
		geoEquirectangular,
		geoMercator,
		geoNaturalEarth1,
		geoOrthographic,
		geoStereographic,
		type GeoProjection
	} from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, Layer } from 'layerchart';
	import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';
	import { SelectField } from 'svelte-ux';
	const countries = feature(topology, topology.objects.countries);

	const projections: { label: string; value: () => GeoProjection }[] = [
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Stereographic', value: geoStereographic },
		{ label: 'Orthographic', value: geoOrthographic }
	];

	let projection = $state(projections[0].value);

	const data = { topology, countries };
	export { data };
</script>

<div class="mb-4 screenshot-hidden">
	<SelectField
		label="Projection"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>

<Chart
	geo={{
		projection,
		fitGeojson: { type: 'Sphere' }
	}}
	padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
	height={500}
>
	<Layer type="canvas">
		<GeoRaster image="/images/blue-marble.jpg" interpolate="bilinear" />
	</Layer>
	<Layer type="svg">
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-none stroke-surface-content/40" />
		<Graticule class="stroke-surface-content/15" />
		{#each countries.features as feature}
			<GeoPath geojson={feature} class="fill-none stroke-surface-content/40" />
		{/each}
	</Layer>
</Chart>
