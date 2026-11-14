<script lang="ts">
	import type { ChartState } from 'layerchart';
	import { Chart, GeoTile, Light, Tooltip, WebGL, perspective } from '@layerchart/webgl';
	import { geoMercator } from 'd3-geo';
	import { RangeField, SelectField, Switch, Field } from 'svelte-ux';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { pixelsPerMeter } from '$lib/utils/elevation.js';

	type Bounds = [[west: number, south: number], [east: number, north: number]];

	const places: { label: string; bounds: Bounds }[] = [
		{
			label: 'Mt. St Helens',
			bounds: [
				[-122.3, 46.13],
				[-122.09, 46.25]
			]
		},
		{
			label: 'Mt. Rainier',
			bounds: [
				[-121.92, 46.76],
				[-121.6, 46.94]
			]
		},
		{
			label: 'Grand Canyon',
			bounds: [
				[-112.25, 36.0],
				[-111.95, 36.2]
			]
		},
		{
			label: 'Matterhorn',
			bounds: [
				[7.58, 45.93],
				[7.74, 46.03]
			]
		},
		{
			label: 'Mt. Fuji',
			bounds: [
				[138.62, 35.29],
				[138.84, 35.43]
			]
		},
		{
			label: 'Yosemite Valley',
			bounds: [
				[-119.68, 37.69],
				[-119.5, 37.78]
			]
		}
	];

	// Satellite imagery covers the whole world to zoom 12 (beyond, only where there are
	// orthophotos); the elevation tiles go to 15
	const surfaces = {
		Satellite: {
			url: (x: number, y: number, z: number) =>
				`https://tiles.versatiles.org/tiles/satellite-raster/${z}/${x}/${y}`,
			maxZoom: 12
		},
		'Street map': {
			url: (x: number, y: number, z: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
			maxZoom: 19
		}
	};
	const elevation = (x: number, y: number, z: number) =>
		`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

	let placeLabel = $state('Mt. St Helens');
	let surface = $state<keyof typeof surfaces>('Satellite');
	let exaggeration = $state(1.5);
	let debug = $state(false);

	const place = $derived(places.find((p) => p.label === placeLabel)!);
	/** The area as a polygon (its ring clockwise, as d3-geo reads an outside ring) */
	const area = $derived.by(() => {
		const [[west, south], [east, north]] = place.bounds;
		return {
			type: 'Feature' as const,
			properties: {},
			geometry: {
				type: 'Polygon' as const,
				coordinates: [
					[
						[west, south],
						[west, north],
						[east, north],
						[east, south],
						[west, south]
					]
				]
			}
		};
	});

	// The tiles' elevations set the `z` domain (lowest to highest meters loaded); the range turns
	// that span into pixels at the map's own scale, so heights are true (times the exaggeration)
	let context = $state<ChartState<any>>();
	const zRange = $derived.by((): [number, number] => {
		const projection = context?.geo.projection;
		const [low, high] = context?.zDomain ?? [0, 0];
		if (!projection || !(high > low)) return [0, 1];
		const [[west, south], [east, north]] = place.bounds;
		const ground = pixelsPerMeter(projection, [(west + east) / 2, (south + north) / 2]);
		return [0, (Number(high) - Number(low)) * ground * exaggeration];
	});
</script>

<div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-2">
	<SelectField
		label="Location"
		options={places.map(({ label }) => ({ label, value: label }))}
		bind:value={placeLabel}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<SelectField
		label="Surface"
		options={Object.keys(surfaces).map((label) => ({ label, value: label }))}
		bind:value={surface}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<RangeField
		label="Exaggeration"
		bind:value={exaggeration}
		min={1}
		max={4}
		step={0.5}
		format="decimal"
	/>
	<Field label="Tiles">
		<Switch bind:checked={debug} />
	</Field>
</div>

<!-- Map tiles draped over elevation tiles, both picked for the area as LayerChart's GeoTile picks
     them -->
<Chart
	bind:context
	padding={24}
	view={perspective({ rotate: -20, tilt: 60, fov: 40 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	geo={{ projection: geoMercator, fitGeojson: area }}
	{zRange}
	tooltipContext
	height={600}
	class="rounded-sm bg-surface-200"
>
	<WebGL>
		<Light azimuth={300} altitude={35} intensity={1.2} />
		<Light type="ambient" intensity={0.6} />
		<GeoTile
			url={surfaces[surface].url}
			maxZoom={surfaces[surface].maxZoom}
			{elevation}
			elevationMaxZoom={15}
			{debug}
			tooltip
		/>
	</WebGL>
	<TransformContextControls />

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="Elevation" value={data.elevation} format="integer" />
				<Tooltip.Item label="Longitude" value={data.longitude} format="decimal" />
				<Tooltip.Item label="Latitude" value={data.latitude} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>

<div class="text-xs text-surface-content/60 mt-1">
	Elevation: <a href="https://registry.opendata.aws/terrain-tiles/" class="underline"
		>AWS Terrain Tiles</a
	>
	· Imagery: <a href="https://versatiles.org" class="underline">VersaTiles</a>,
	<a href="https://www.openstreetmap.org/copyright" class="underline"
		>© OpenStreetMap contributors</a
	>
</div>
