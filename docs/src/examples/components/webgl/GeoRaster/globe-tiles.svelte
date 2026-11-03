<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { Chart, GeoPath, GeoRaster, WebGL, globe, perspective } from '@layerchart/webgl';
	import { feature } from 'topojson-client';
	import { RangeField } from 'svelte-ux';
	import GeoTileControls from '$lib/components/controls/GeoTileControls.svelte';

	const countries = feature(topology, topology.objects.countries);
	const TILE_SIZE = 256;

	let serviceUrl = $state<(x: number, y: number, z: number) => string>(
		(x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
	);
	let zoom = $state(2);

	/**
	 * The world's map tiles at `zoom`, stitched and re-laid out as an equirectangular image for
	 * the globe: tiles are Web Mercator, whose rows stretch towards the poles, so each row of
	 * latitude is copied from where Mercator put it.  Mercator stops at ±85°, so the poles are
	 * left blank.
	 */
	let image = $state<HTMLCanvasElement | null>(null);
	$effect(() => {
		if (typeof window === 'undefined') return;
		const url = serviceUrl;
		const z = zoom;
		let cancelled = false;
		(async () => {
			const tiles = 1 << z;
			const size = tiles * TILE_SIZE;
			const mercator = document.createElement('canvas');
			mercator.width = mercator.height = size;
			const context = mercator.getContext('2d')!;
			await Promise.all(
				Array.from({ length: tiles * tiles }, async (_, i) => {
					const x = i % tiles;
					const y = Math.floor(i / tiles);
					const tile = new Image();
					tile.crossOrigin = 'anonymous';
					tile.src = url(x, y, z);
					try {
						await tile.decode();
					} catch {
						return;
					}
					// At the tile's size in the mosaic, whatever its own (high-DPI tiles are twice as large)
					if (!cancelled)
						context.drawImage(tile, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
				})
			);
			if (cancelled) return;

			const equirectangular = document.createElement('canvas');
			equirectangular.width = size;
			equirectangular.height = size / 2;
			const out = equirectangular.getContext('2d')!;
			for (let row = 0; row < size / 2; row++) {
				const latitude = 90 - ((row + 0.5) / (size / 2)) * 180;
				if (Math.abs(latitude) > 85.05) continue;
				const φ = (latitude * Math.PI) / 180;
				const y = ((1 - Math.log(Math.tan(φ) + 1 / Math.cos(φ)) / Math.PI) / 2) * size;
				out.drawImage(mercator, 0, Math.floor(y), size, 1, 0, row, size, 1);
			}
			image = equirectangular;
		})();
		return () => {
			cancelled = true;
		};
	});

	const data = { topology, countries };
	export { data };
</script>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-4 screenshot-hidden">
	<GeoTileControls bind:serviceUrl />
	<RangeField label="Zoom" bind:value={zoom} min={1} max={4} />
</div>

<Chart
	view={perspective({ rotate: -20, tilt: 60 })}
	transform={{
		mode: 'canvas',
		drag: 'rotate',
		scrollMode: 'scale',
		scrollActivationKey: 'shift',
		// Zoom in no further than the camera stays outside the globe
		scaleExtent: [0.5, 3],
		// Tip on round to the south pole, rather than stopping edge on
		tiltExtent: [0, 180]
	}}
	geo={{ projection: globe, fitGeojson: { type: 'Sphere' } }}
	height={500}
>
	<WebGL>
		<!-- The globe beneath, while the tiles load (and at the poles, past where they stop) -->
		<GeoPath geojson={{ type: 'Sphere' }} fill="var(--color-surface-200)" />
		{#if image}
			<GeoRaster src={image} />
		{/if}
		<GeoPath
			geojson={countries}
			stroke="color-mix(in oklab, var(--color-surface-content) 40%, transparent)"
		/>
	</WebGL>
</Chart>
