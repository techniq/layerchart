<script lang="ts">
	import { geoMercator, geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, GeoRaster, Graticule, Layer } from 'layerchart';
	import { RangeField } from 'svelte-ux';
	import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';
	import { getCountriesTopology } from '$lib/geo.remote.js';

	const topology = await getCountriesTopology();
	const countries = feature(topology, topology.objects.countries);

	const TILE_SIZE = 256;

	let serviceUrl = $state<(x: number, y: number, z: number) => string>(
		(x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
	);
	let doubleScale = $state(false);
	let zoom = $state(2);

	// Stitched Web Mercator mosaic: one canvas covering the full world at the
	// selected zoom level. Re-fetched whenever `serviceUrl` or `zoom` changes.
	let mosaic = $state<HTMLCanvasElement | null>(null);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const url = serviceUrl;
		const z = zoom;

		let cancelled = false;

		async function stitch() {
			const tiles = 1 << z; // 2^z tiles per side
			const size = tiles * TILE_SIZE;
			const canvas = document.createElement('canvas');
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			await Promise.all(
				Array.from({ length: tiles }, (_, y) =>
					Array.from({ length: tiles }, async (_, x) => {
						const img = new Image();
						img.crossOrigin = 'anonymous';
						img.src = url(x, y, z);
						try {
							await img.decode();
						} catch {
							return;
						}
						if (cancelled) return;
						ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
					})
				).flat()
			);

			if (cancelled) return;
			mosaic = canvas;
		}

		stitch();

		return () => {
			cancelled = true;
		};
	});

	// Source projection for the mosaic: Web Mercator sized to exactly match the
	// stitched canvas dimensions. Re-created when `zoom` changes.
	const sourceProjection = $derived(() => {
		const size = (1 << zoom) * TILE_SIZE;
		return geoMercator()
			.scale(size / (2 * Math.PI))
			.translate([size / 2, size / 2])
			.precision(0);
	});
</script>

<div class="grid grid-cols-[1fr_auto] gap-3 items-end mb-2">
	<GeoTileControls bind:serviceUrl bind:doubleScale />
	<RangeField label="Zoom" bind:value={zoom} min={0} max={4} step={1} />
</div>

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
	padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
	height={500}
>
	<Layer type="canvas">
		{#if mosaic}
			<GeoRaster image={mosaic} {sourceProjection} interpolate="bilinear" />
		{/if}
	</Layer>
	<Layer type="svg">
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-none stroke-surface-content/40" />
		<Graticule class="stroke-surface-content/15" />
		{#each countries.features as feature}
			<GeoPath geojson={feature} class="fill-none stroke-surface-content/30" />
		{/each}
	</Layer>
</Chart>
