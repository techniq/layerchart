<script lang="ts">
	import { Chart, Light, Scene, Surface, Tooltip } from '@layerchart/3d';
	import { extent } from 'd3-array';
	import { geoMercator } from 'd3-geo';
	import { scaleSequential } from 'd3-scale';
	import { interpolateRgbBasis } from 'd3-interpolate';
	import { Field, RangeField, SelectField, Switch } from 'svelte-ux';
	import SceneControls from '$lib/components/controls/SceneControls.svelte';
	import { loadElevation, pixelsPerMeter } from '$lib/utils/elevation.js';

	type Place = { label: string; bounds: [[number, number], [number, number]]; zoom: number };
	const places: Place[] = [
		{
			label: 'Grand Canyon',
			bounds: [
				[-112.3, 35.98],
				[-111.95, 36.2]
			],
			zoom: 12
		},
		{
			label: 'Mount Rainier',
			bounds: [
				[-121.92, 46.78],
				[-121.6, 46.94]
			],
			zoom: 12
		},
		{
			label: 'Yosemite Valley',
			bounds: [
				[-119.7, 37.68],
				[-119.5, 37.78]
			],
			zoom: 13
		},
		{
			label: 'Mount Everest',
			bounds: [
				[86.82, 27.92],
				[87.02, 28.04]
			],
			zoom: 12
		},
		{
			label: 'Matterhorn',
			bounds: [
				[7.6, 45.94],
				[7.72, 46.02]
			],
			zoom: 13
		}
	];

	let selected = $state(places[0].label);
	const place = $derived(places.find((p) => p.label === selected) ?? places[0]);
	const bounds = $derived(place.bounds);
	const west = $derived(bounds[0][0]);
	const south = $derived(bounds[0][1]);
	const east = $derived(bounds[1][0]);
	const north = $derived(bounds[1][1]);
	// Clockwise, as d3-geo reads a polygon's outside ring (the other way round is the rest of the world)
	const box = $derived({
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
	});

	/** Meters above sea level, and their range for the colors and heights */
	let terrain = $state<{ elevation: (lon: number, lat: number) => number; range: number[] } | null>(
		null
	);
	$effect(() => {
		const current = place;
		if (typeof window === 'undefined') return;
		let cancelled = false;
		terrain = null;
		loadElevation({ bounds: current.bounds, zoom: current.zoom }).then((elevation) => {
			if (cancelled) return;
			// A coarse pass for the range
			const [[w, s], [e, n]] = current.bounds;
			const samples = Array.from({ length: 50 * 50 }, (_, i) =>
				elevation(w + ((e - w) * (i % 50)) / 49, s + ((n - s) * Math.floor(i / 50)) / 49)
			);
			terrain = { elevation, range: extent(samples) as number[] };
		});
		return () => {
			cancelled = true;
		};
	});

	let azimuth = $state(300);
	let altitude = $state(25);
	let shadow = $state(true);
	let exaggeration = $state(1.5);

	// Zoom, reset, and whether a drag turns the view or pans it
	let scene = $state<ReturnType<typeof Scene>>();
	let drag = $state<'rotate' | 'pan'>('rotate');

	const tints = interpolateRgbBasis([
		'#3f6b35',
		'#8fae62',
		'#d9c98f',
		'#a88462',
		'#7a6a5e',
		'#ffffff'
	]);
</script>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-2">
	<SelectField
		label="Place"
		options={places.map((p) => ({ label: p.label, value: p.label }))}
		bind:value={selected}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<Field label="Shadows">
		<Switch bind:checked={shadow} />
	</Field>
</div>
<div class="grid grid-cols-3 gap-2 mb-2">
	<RangeField label="Sun azimuth" bind:value={azimuth} min={0} max={360} step={5} />
	<RangeField label="Sun altitude" bind:value={altitude} min={3} max={90} step={1} />
	<!-- Always a decimal, so the value doesn't change width as it steps -->
	<RangeField
		label="Exaggeration"
		bind:value={exaggeration}
		min={1}
		max={4}
		step={0.5}
		format={{ type: 'decimal', options: { minimumFractionDigits: 1, maximumFractionDigits: 1 } }}
	/>
</div>

<!-- Heights at true scale to the map (times the exaggeration), lit by a sun you can move -->
<Chart
	geo={{ projection: geoMercator, fitGeojson: box }}
	cScale={scaleSequential(tints)}
	zDomain={terrain?.range ?? [0, 1]}
	zRange={({ width, height }) => [
		0,
		// At the map's scale, times the exaggeration
		(terrain ? terrain.range[1] - terrain.range[0] : 0) *
			pixelsPerMeter(geoMercator().fitSize([width, height], box), [west, (south + north) / 2]) *
			exaggeration || 1
	]}
	tooltipContext
	height={550}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene bind:this={scene} rotate={-20} tilt={50} {drag} scrollActivationKey="shift">
		<Light {azimuth} {altitude} intensity={1.2} {shadow} />
		<Light type="ambient" intensity={0.3} />
		{#if terrain}
			<Surface value={terrain.elevation} pixelSize={2} tooltip />
		{/if}
	</Scene>

	<SceneControls {scene} bind:drag />

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="Elevation (m)" value={data.value} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
