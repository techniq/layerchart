---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { geoAlbersUsa, geoAlbers, geoEqualEarth, geoEquirectangular, geoMercator, geoNaturalEarth1, geoOrthographic } from 'd3-geo';
	import { index } from 'd3-array';
	import { scaleQuantize } from 'd3-scale';
	import { feature } from 'topojson-client';

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
	import { Button, Field, Switch } from 'svelte-ux'

	import Preview from '$lib/docs/Preview.svelte';
	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Graticule from '$lib/components/Graticule.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	export let data;

	let projection = geoOrthographic;
	const projections = [
		{ name: 'Albers', value: geoAlbers },
		{ name: 'AlbersUsa', value: geoAlbersUsa },
		{ name: 'Equal Earth', value: geoEqualEarth },
		{ name: 'Equirectangular', value: geoEquirectangular },
		{ name: 'Mercator', value: geoMercator },
		{ name: 'Natural Earth', value: geoNaturalEarth1 },
		{ name: 'Orthographic', value: geoOrthographic },
	]

	let detailed = false;

	$: dataGeoJson = detailed ? data.geojsonDetail : data.geojson;

	$: geojson = feature(dataGeoJson, dataGeoJson.objects.countries);

	let yaw = 0;
	let pitch = 0;
	let roll = 0;
	let scale = 0;
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,auto] gap-2 my-2">
	<Field label="Projections" let:id>
		<select bind:value={projection} class="w-full outline-none appearance-none text-sm" {id}>
			{#each projections as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
	</Field>
	<Field label="Yaw" let:id>
		<Button icon={mdiChevronLeft} on:click={() => yaw -= 1} class="mr-2" />
		<input type="range" bind:value={yaw} min={-360} max={360} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{yaw}</span>
		<Button icon={mdiChevronRight} on:click={() => yaw += 1} class="ml-2" />
	</Field>
	<Field label="Pitch" let:id>
		<Button icon={mdiChevronLeft} on:click={() => pitch -= 1} class="mr-2" />
		<input type="range" bind:value={pitch} min={-90} max={90} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{pitch}</span>
		<Button icon={mdiChevronRight} on:click={() => pitch += 1} class="ml-2" />
	</Field>
	<Field label="Roll" let:id>
		<Button icon={mdiChevronLeft} on:click={() => roll -= 1} class="mr-2" />
		<input type="range" bind:value={roll} min={-180} max={180} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{roll}</span>
		<Button icon={mdiChevronRight} on:click={() => roll += 1} class="ml-2" />
	</Field>
	<Field label="Scale" let:id>
		<Button icon={mdiChevronLeft} on:click={() => scale -= 1} class="mr-2" />
		<input type="range" bind:value={scale} min={-100} max={3000} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{scale}</span>
		<Button icon={mdiChevronRight} on:click={() => scale += 1} class="ml-2" />
	</Field>
	<Field label="Detail" let:id>
		<Switch bind:checked={detailed} {id} />
	</Field>
</div>

## SVG

<Preview>
	<div class="h-[600px] overflow-hidden">
		<Chart
			geo={{
				projection,
				fitGeojson: geojson,
				rotate: {
					yaw,
					pitch,
					roll,
				},
				scale
			}}
			padding={{ left: 100, right: 100 }}
			tooltip={{ mode: 'manual' }}
			let:tooltip
		>
			<Svg>
				<GeoPath geojson={{ type: 'Sphere' }} class="stroke-black fill-blue-300" />
				{#each geojson.features as feature}
					<GeoPath geojson={feature} {tooltip} class="stroke-black fill-white hover:fill-gray-300" />
				{/each}
				<Graticule class="stroke-black/20 pointer-events-none" />
			</Svg>
			<Tooltip header={(data) => data.properties.name} let:data />
		</Chart>
	</div>
</Preview>

## Canvas

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection,
				fitGeojson: geojson,
				rotate: {
					yaw,
					pitch,
					roll,
				},
				scale
			}}
		>
			<Canvas>
				<GeoPath geojson={{ type: 'Sphere' }} fill="#93c5fd" />
			</Canvas>
			<Canvas>
				<GeoPath {geojson} fill="white"/>
			</Canvas>
			<Canvas>
				<Graticule stroke="rgba(0,0,0,.20)" />
			</Canvas>
		</Chart>
	</div>
</Preview>
