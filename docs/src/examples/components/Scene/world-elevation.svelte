<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, Light, Scene, Surface, Tooltip, globe, perspective } from '@layerchart/3d';
	import {
		geoEqualEarth,
		geoEquirectangular,
		geoNaturalEarth1,
		geoOrthographic,
		type GeoProjection
	} from 'd3-geo';
	import { scaleLinear } from 'd3-scale';
	import { RangeField, SelectField } from 'svelte-ux';
	import { loadElevation } from '$lib/utils/elevation.js';

	/** Meters above (or below) sea level, ocean floor included */
	let elevation = $state<((longitude: number, latitude: number) => number) | null>(null);
	onMount(async () => {
		// The tiles stop at ±85°, so the poles take the nearest row's heights
		elevation = await loadElevation({
			bounds: [
				[-180, -90],
				[180, 90]
			],
			zoom: 3
		});
	});

	const projections: { label: string; value: string; projection: () => GeoProjection }[] = [
		{ label: 'Natural Earth', value: 'natural-earth', projection: geoNaturalEarth1 },
		{ label: 'Equal Earth', value: 'equal-earth', projection: geoEqualEarth },
		{ label: 'Equirectangular', value: 'equirectangular', projection: geoEquirectangular },
		{ label: 'Orthographic', value: 'orthographic', projection: geoOrthographic },
		{ label: 'Globe', value: 'globe', projection: globe }
	];
	let selected = $state('natural-earth');
	const projection = $derived(projections.find((p) => p.value === selected)?.projection);

	let exaggeration = $state(6);

	// Deep ocean blues up to the coast, then land tints up to the peaks
	const domain = [-8000, -3000, -200, 0, 300, 1500, 3500, 6000];
	const tints = scaleLinear<string>()
		.domain(domain)
		.range(['#0b2540', '#1d4e89', '#5fa8d3', '#bfe3f0', '#4a7c3f', '#c9b77c', '#8b6b4f', '#ffffff'])
		.clamp(true);
</script>

<div class="grid grid-cols-2 gap-2 mb-2">
	<SelectField
		label="Projection"
		options={projections.map(({ label, value }) => ({ label, value }))}
		bind:value={selected}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<RangeField label="Exaggeration" bind:value={exaggeration} min={1} max={20} step={1} />
</div>

<Chart
	view={perspective({ rotate: 0, tilt: selected === 'globe' ? 75 : 40 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	geo={projection ? { projection, fitGeojson: { type: 'Sphere' } } : undefined}
	cScale={tints}
	cDomain={domain}
	zDomain={[-11000, 9000]}
	zRange={({ height }) => [0, (height / 50) * exaggeration]}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene>
		<Light azimuth={315} altitude={35} />
		<Light type="ambient" intensity={0.45} />
		{#if elevation}
			<!-- On the globe, heights are raised off the sphere -->
			<Surface value={elevation} pixelSize={3} tooltip />
		{/if}
	</Scene>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="Elevation" value={data.value} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
