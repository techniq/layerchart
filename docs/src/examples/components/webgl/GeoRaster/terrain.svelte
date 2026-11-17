<script lang="ts">
	import { Chart, GeoRaster, Light, Tooltip, WebGL, perspective } from '@layerchart/webgl';
	import { geoMercator } from 'd3-geo';
	import { RangeField, SelectField } from 'svelte-ux';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { loadElevation, loadTileImage, pixelsPerMeter } from '$lib/utils/elevation.js';

	type Bounds = [[west: number, south: number], [east: number, north: number]];
	type Place = { label: string; bounds: Bounds; zoom: number };

	// Each place's area, and the zoom its imagery loads at: 12 is as far as the satellite imagery
	// covers the whole world, and beyond it only where there are orthophotos (ex. the Alps)
	const places: Place[] = [
		{
			label: 'Mt. St Helens',
			bounds: [
				[-122.3, 46.13],
				[-122.09, 46.25]
			],
			zoom: 12
		},
		{
			label: 'Mt. Rainier',
			bounds: [
				[-121.92, 46.76],
				[-121.6, 46.94]
			],
			zoom: 12
		},
		{
			label: 'Grand Canyon',
			bounds: [
				[-112.25, 36.0],
				[-111.95, 36.2]
			],
			zoom: 12
		},
		{
			label: 'Matterhorn',
			bounds: [
				[7.58, 45.93],
				[7.74, 46.03]
			],
			zoom: 13
		},
		{
			label: 'Mt. Fuji',
			bounds: [
				[138.62, 35.29],
				[138.84, 35.43]
			],
			zoom: 12
		},
		{
			label: 'Yosemite Valley',
			bounds: [
				[-119.68, 37.69],
				[-119.5, 37.78]
			],
			zoom: 12
		}
	];

	const surfaces = {
		Satellite: (x: number, y: number, z: number) =>
			`https://tiles.versatiles.org/tiles/satellite-raster/${z}/${x}/${y}`,
		'Street map': (x: number, y: number, z: number) =>
			`https://tile.openstreetmap.org/${z}/${x}/${y}.png`
	};

	let placeLabel = $state('Mt. St Helens');
	let surface = $state<keyof typeof surfaces>('Satellite');
	let exaggeration = $state(1.5);

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

	/** Elevation in meters (`NaN` beyond the area), and the lowest and highest in it */
	let terrain = $state<{
		elevation: (longitude: number, latitude: number) => number;
		low: number;
		high: number;
	} | null>(null);
	/** The imagery, and which place it's of (so a new place doesn't show the last one's) */
	let imagery = $state<(Awaited<ReturnType<typeof loadTileImage>> & { label: string }) | null>(
		null
	);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const { bounds, zoom } = place;
		let cancelled = false;
		terrain = null;
		// Elevation changes more gently than the ground's color, so a coarser zoom does
		loadElevation({ bounds, zoom: Math.min(zoom, 12) }).then((elevation) => {
			if (cancelled) return;
			// Its range, from a grid of samples over the area
			const [[west, south], [east, north]] = bounds;
			let low = Infinity;
			let high = -Infinity;
			for (let i = 0; i <= 64; i++) {
				for (let j = 0; j <= 64; j++) {
					const meters = elevation(
						west + ((east - west) * i) / 64,
						south + ((north - south) * j) / 64
					);
					if (Number.isFinite(meters))
						[low, high] = [Math.min(low, meters), Math.max(high, meters)];
				}
			}
			terrain = { elevation, low, high };
		});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		const { bounds, zoom, label } = place;
		const url = surfaces[surface];
		let cancelled = false;
		loadTileImage({ bounds, zoom, url }).then((loaded) => {
			if (!cancelled) imagery = { ...loaded, label };
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2">
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
</div>

<!-- Elevation from AWS's open terrain tiles, with imagery draped over it.  Loaded once for the
     area, so it doesn't sharpen as you zoom in. -->
<Chart
	padding={24}
	view={perspective({ rotate: -20, tilt: 60, fov: 40 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	geo={{ projection: geoMercator, fitGeojson: area }}
	zDomain={terrain ? [terrain.low, terrain.high] : [0, 1]}
	zRange={({ width, height }) => {
		if (!terrain) return [0, 0];
		// Meters on the ground in pixels where the map is drawn, so heights are true to scale
		const ground = geoMercator().fitSize([width, height], area);
		const center = [
			(place.bounds[0][0] + place.bounds[1][0]) / 2,
			(place.bounds[0][1] + place.bounds[1][1]) / 2
		] as [number, number];
		return [0, (terrain.high - terrain.low) * pixelsPerMeter(ground, center) * exaggeration];
	}}
	tooltipContext
	height={600}
	class="rounded-sm bg-surface-200"
>
	<WebGL>
		<Light azimuth={300} altitude={35} intensity={1.2} />
		<Light type="ambient" intensity={0.6} />
		{#if terrain && imagery?.label === place.label}
			<GeoRaster
				image={imagery.image}
				sourceProjection={imagery.projection}
				elevation={terrain.elevation}
				pixelSize={2}
				tooltip
			/>
		{/if}
	</WebGL>
	<TransformContextControls />

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="Elevation" value={data.value} format="integer" />
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
	· Imagery:
	<a href="https://versatiles.org" class="underline">VersaTiles</a>,
	<a href="https://www.openstreetmap.org/copyright" class="underline"
		>© OpenStreetMap contributors</a
	>
</div>
