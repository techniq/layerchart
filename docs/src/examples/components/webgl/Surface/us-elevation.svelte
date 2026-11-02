<script module lang="ts">
	import { getUsStatesTopology } from '$lib/geo.remote.js';
	const topology = await getUsStatesTopology();
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, Light, WebGL, Surface, Tooltip, perspective } from '@layerchart/webgl';
	import { geoAlbers } from 'd3-geo';
	import { scaleSequential } from 'd3-scale';
	import { interpolateRgbBasis } from 'd3-interpolate';
	import { feature } from 'topojson-client';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { createMask, loadElevation } from '$lib/utils/elevation.js';

	const states = feature(topology, topology.objects.states);
	// The lower 48: Alaska, Hawaii, and the territories would zoom the map out
	const outside = ['02', '15', '60', '66', '69', '72', '78'];
	const conus = {
		type: 'FeatureCollection' as const,
		features: states.features.filter((f) => !outside.includes(String(f.id)))
	};

	/** Meters above sea level, `NaN` off the lower 48 */
	let elevation = $state<((longitude: number, latitude: number) => number) | null>(null);
	onMount(async () => {
		const [sample, inside] = await Promise.all([
			loadElevation({
				bounds: [
					[-125, 24.3],
					[-66.9, 49.5]
				],
				zoom: 5
			}),
			createMask(conus)
		]);
		elevation = (longitude, latitude) =>
			inside(longitude, latitude) ? Math.max(0, sample(longitude, latitude)) : NaN;
	});

	// The sun: which way it shines from, and how high
	let azimuth = $state(315);
	let altitude = $state(30);
	let shadow = $state(true);
	let exaggeration = $state(8);

	// Hypsometric tints: lowland green through desert tan to snowy peaks
	const tints = interpolateRgbBasis([
		'#4a7c3f',
		'#9cb466',
		'#e8dc9a',
		'#c69c6d',
		'#8b6b4f',
		'#f2f2f2'
	]);
</script>

<div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-2">
	<RangeField label="Sun azimuth" bind:value={azimuth} min={0} max={360} step={5} />
	<RangeField label="Sun altitude" bind:value={altitude} min={5} max={90} step={1} />
	<RangeField label="Exaggeration" bind:value={exaggeration} min={1} max={20} step={1} />
	<Field label="Shadows">
		<Switch bind:checked={shadow} />
	</Field>
</div>

<!-- Elevation from AWS's open terrain tiles, raised and lit like a shaded relief map -->
<Chart
	view={perspective({ rotate: 0, tilt: 45 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	geo={{ projection: geoAlbers, fitGeojson: conus }}
	cScale={scaleSequential(tints)}
	zDomain={[0, 4400]}
	zRange={({ height }) => [0, (height / 80) * exaggeration]}
	tooltipContext
	height={550}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		<Light {azimuth} {altitude} intensity={1.1} {shadow} />
		<Light type="ambient" intensity={0.35} />
		{#if elevation}
			<Surface value={elevation} pixelSize={3} tooltip />
		{/if}
	</WebGL>

	<TransformContextControls />

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="Elevation" value={data.value} format="integer" />
				<Tooltip.Item label="Longitude" value={data.x} format="decimal" />
				<Tooltip.Item label="Latitude" value={data.y} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
