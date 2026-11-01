<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { Chart, GeoPath, GeoRaster, Scene } from '@layerchart/3d';
	import {
		geoEqualEarth,
		geoEquirectangular,
		geoGraticule10,
		geoMercator,
		geoNaturalEarth1,
		geoOrthographic,
		geoStereographic,
		type GeoProjection
	} from 'd3-geo';
	import { feature } from 'topojson-client';
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

<!-- The image is laid over the map through the chart's projection, like the borders -->
<Chart
	geo={{ projection, fitGeojson: { type: 'Sphere' } }}
	padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene rotate={0} tilt={35} scrollActivationKey="shift">
		<GeoRaster src="/images/blue-marble.jpg" pixelSize={3} />
		<GeoPath
			geojson={geoGraticule10()}
			fill={null}
			stroke="color-mix(in oklab, var(--color-surface-content) 15%, transparent)"
		/>
		<GeoPath
			geojson={countries}
			fill={null}
			stroke="color-mix(in oklab, var(--color-surface-content) 40%, transparent)"
		/>
	</Scene>
</Chart>
