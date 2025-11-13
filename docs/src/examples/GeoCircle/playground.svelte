<script lang="ts">
	import { Chart, GeoCircle, GeoPath, Graticule, Layer } from 'layerchart';
	import {
		geoAlbersUsa,
		geoAlbers,
		geoEqualEarth,
		geoEquirectangular,
		geoMercator,
		geoNaturalEarth1,
		geoOrthographic
	} from 'd3-geo';
	import { range } from 'd3-array';
	import { feature } from 'topojson-client';
	import { getCountriesTopology } from '$lib/geo.remote';

	import GeoCircleControls from '$lib/components/GeoCircleControls.svelte';

	let config = $state({
		example: 'single' as 'single' | 'multi',
		latitude: 0,
		longitude: 0,
		radius: 600,
		precision: 6,
		projection: geoNaturalEarth1
	});

	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Orthographic', value: geoOrthographic }
	];

	const topology = await getCountriesTopology();
	const geojson = $derived(feature(topology, topology.objects.countries));
	const features = $derived(
		config.projection === geoAlbersUsa
			? geojson.features.filter((f) => f.properties.name === 'United States of America')
			: geojson.features
	);

	const step = 10;
	const coordinates = range(-80, 80 + step, step).flatMap((y) => {
		return range(-180, 180 + step, step).map((x) => {
			return [x, y];
		});
	});
</script>

<GeoCircleControls bind:config {projections} />
<Chart
	geo={{
		projection: config.projection,
		fitGeojson: geojson
	}}
	height={600}
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content/30" id="globe" />
		<Graticule class="stroke-surface-content/20" />

		{#each features as feature}
			<GeoPath
				geojson={feature}
				class="stroke-surface-content/30 fill-surface-content/20 pointer-events-none"
			/>
		{/each}

		{#if config.example === 'single'}
			<GeoCircle
				center={[config.longitude, config.latitude]}
				radius={(config.radius / (6371 * Math.PI * 2)) * 360}
				precision={config.precision}
				class="fill-danger stroke-none"
			/>
		{:else if config.example === 'multi'}
			{#each coordinates as coords}
				<GeoCircle
					center={[coords[0], coords[1]]}
					radius={step / 4}
					precision={config.precision}
					class="stroke-danger"
				/>
			{/each}
		{/if}
	</Layer>
</Chart>
