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
	import { getCountries } from '$lib/data.remote';

	import { Field, RangeField, SelectField, ToggleGroup, ToggleOption } from 'svelte-ux';

	let example: 'single' | 'multi' = $state('single');
	let latitude = $state(0);
	let longitude = $state(0);
	let radius = $state(600);
	let precision = $state(6);

	let projection = $state(geoNaturalEarth1);
	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Orthographic', value: geoOrthographic }
	];

	const topojson = await getCountries();
	const geojson = $derived(feature(topojson, topojson.objects.countries));
	const features = $derived(
		projection === geoAlbersUsa
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

<div class="grid grid-cols-2 gap-2 my-2">
	<Field label="Example">
		<ToggleGroup bind:value={example} variant="outline" inset class="w-full" size="sm">
			<ToggleOption value="single">Single</ToggleOption>
			<ToggleOption value="multi">Multi</ToggleOption>
		</ToggleGroup>
	</Field>

	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>

	<RangeField
		label="Latitude"
		bind:value={latitude}
		min={-90}
		max={90}
		disabled={example != 'single'}
	/>
	<RangeField
		label="Longitude"
		bind:value={longitude}
		min={-180}
		max={180}
		disabled={example != 'single'}
	/>
	<RangeField label="Radius (km)" bind:value={radius} max={6371} disabled={example != 'single'} />
	<RangeField label="Precision" bind:value={precision} max={90} disabled={example != 'single'} />
</div>

<Chart
	geo={{
		projection,
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

		{#if example === 'single'}
			<GeoCircle
				center={[longitude, latitude]}
				radius={(radius / (6371 * Math.PI * 2)) * 360}
				{precision}
				class="fill-danger stroke-none"
			/>
		{:else if example === 'multi'}
			{#each coordinates as coords}
				<GeoCircle
					center={[coords[0], coords[1]]}
					radius={step / 4}
					{precision}
					class="stroke-danger"
				/>
			{/each}
		{/if}
	</Layer>
</Chart>
