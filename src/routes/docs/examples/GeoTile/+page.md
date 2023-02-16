---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { index } from 'd3-array';
	import { scaleQuantize } from 'd3-scale';
	import { geoMercator } from 'd3-geo';
	import { feature } from 'topojson-client';
	
	import { Button, Field } from 'svelte-ux';
	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import Preview from '$lib/docs/Preview.svelte';
	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import ClipPathUse from '$lib/components/ClipPathUse.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import GeoTile from '$lib/components/GeoTile.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	import geojson from '../_data/geo/us-states-topojson.js';

	const states = feature(geojson, geojson.objects.collection);

	$: filteredStates = { ...states, features: states.features.filter(d => d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii' )}
	// $: filteredStates = { ...states, features: states.features.filter(d => d.properties.name === 'West Virginia')}
	$: selectedFeature = filteredStates;

	// TODO: Access via context, or possibly global state
	const ACCESS_TOKEN = 'pk.eyJ1IjoidGVjaG5pcTM1IiwiYSI6ImNsZTR5cDd0ZjAyNm8zdnFvczhzdnFpcXkifQ.-LAr8sl5BZ3y-H0pDyD1qA';
	

	const mapboxv1 = style => (x ,y ,z) => {
		return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/${z}/${x}/${y}${devicePixelRatio > 1 ? "@2x" : ""}?access_token=${ACCESS_TOKEN}`
	}

	const mapboxv4 = tileset => (x ,y ,z) => {
		return `https://${'abc'[Math.abs(x + y) % 3]}.tiles.mapbox.com/v4/${tileset}/${z}/${x}/${y}${devicePixelRatio > 1 ? '@2x' : ''}.png?access_token=${ACCESS_TOKEN}`;
	}

	// https://docs.mapbox.com/api/maps/raster-tiles/
	// https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/
	// https://docs.mapbox.com/api/maps/styles/
	const serviceOptions = [
		{ name: 'streets-v11 (v1)', url: mapboxv1('streets-v11') },
		{ name: 'light-v10 (v1)', url: mapboxv1('light-v10') },
		{ name: 'dark-v10 (v1)', url: mapboxv1('dark-v10') },
		{ name: 'outdoors-v12 (v1)', url: mapboxv1('outdoors-v12') },
		{ name: 'satelllite-v9 (v1)', url: mapboxv1('satellite-v9') },
		{ name: 'satelllite-streets-v12 (v1)', url: mapboxv1('satellite-streets-v12') },
		{ name: 'navigation-day-v1 (v1)', url: mapboxv1('navigation-day-v1') },
		{ name: 'navigation-night-v1 (v1)', url: mapboxv1('navigation-night-v1') },
		{ name: 'natural-earth-2 (v4)', url: mapboxv4('mapbox.natural-earth-2') },
		{ name: 'satellite (v4)', url: mapboxv4('mapbox.satellite') },
		{ name: 'streets (v4)', url: mapboxv4('mapbox.mapbox-streets-v8') },
		{ name: 'terrain (v4)', url: mapboxv4('mapbox.mapbox-terrain-v2') },
		{ name: 'terrain-dem (v4)', url: mapboxv4('mapbox.mapbox-terrain-dem-v1') },
		{ name: 'traffic (v4)', url: mapboxv4('mapbox.mapbox-traffic-v1') },
		{ name: 'transit (v4)', url: mapboxv4('mapbox.transit-v2') },
	]
	let serviceUrl = serviceOptions.find(o => o.name === 'natural-earth-2 (v4)').url
	let zoomDelta = 0;
</script>

<div class="grid grid-cols-[1fr,1fr,1fr] gap-2 my-2">
	<Field label="Tileset" let:id>
		<select bind:value={serviceUrl} class="w-full outline-none appearance-none text-sm" {id}>
			{#each serviceOptions as option}
				<option value={option.url}>{option.name}</option>
			{/each}
		</select>
	</Field>
	<Field label="Zoom delta" let:id>
		<Button icon={mdiChevronLeft} on:click={() => zoomDelta -= 1} class="mr-2" />
		<input type="range" bind:value={zoomDelta} min={-5} max={5} step={1} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{zoomDelta}</span>
		<Button icon={mdiChevronRight} on:click={() => zoomDelta += 1} class="ml-2" />
	</Field>
</div>

## SVG

<Preview>
	<div class="h-[600px] overflow-hidden">
		<Chart
			geo={{
				projection: geoMercator,
				geojson: selectedFeature,
			}}
			tooltip={{ mode: 'manual' }}
			let:tooltip
			let:projection
		>
			<Svg>
				<GeoTile url={serviceUrl} {zoomDelta} />
				{#each filteredStates.features as feature}
					<GeoPath
						geojson={feature}
						{tooltip}
						class="stroke-black/20 hover:fill-white/30"
						on:click={() => selectedFeature  = selectedFeature === feature ? filteredStates : feature}
					/>
				{/each}
			</Svg>
			<Tooltip header={(data) => data.properties.name} let:data>
				{@const [longitude, latitude] = projection.invert([tooltip.left,tooltip.top])}
				<TooltipItem
					label="longitude"
					value={longitude}
					format="decimal"
				/>
				<TooltipItem
					label="latitude"
					value={latitude}
					format="decimal"
				/>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## SVG (clipped)

<Preview>
	<div class="h-[600px] overflow-hidden">
		<Chart
			geo={{
				projection: geoMercator,
				geojson: selectedFeature
			}}
			tooltip={{ mode: 'manual' }}
			let:tooltip
			let:projection
		>
			<Svg>
				<ClipPathUse refId="clip">
					<GeoTile url={serviceUrl} {zoomDelta} />
				</ClipPathUse>
				<GeoPath geojson={selectedFeature} id="clip" class="stroke-none" />
				{#each filteredStates.features as feature}
					<GeoPath
						geojson={feature}
						{tooltip}
						class="stroke-black/20 hover:fill-white/30"
						on:click={() => selectedFeature  = selectedFeature === feature ? filteredStates : feature}
					/>
				{/each}
			</Svg>
			<Tooltip header={(data) => data.properties.name} let:data>
				{@const [longitude, latitude] = projection.invert([tooltip.left,tooltip.top])}
				<TooltipItem
					label="longitude"
					value={longitude}
					format="decimal"
				/>
				<TooltipItem
					label="latitude"
					value={latitude}
					format="decimal"
				/>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Canvas

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection: geoMercator,
				geojson: selectedFeature
			}}
		>
			<Canvas>
				<GeoTile url={serviceUrl} {zoomDelta} />
			</Canvas>
			<Canvas>
				<GeoPath geojson={filteredStates} stroke="rgba(0,0,0,.2)" />
			</Canvas>
		</Chart>
	</div>
</Preview>
