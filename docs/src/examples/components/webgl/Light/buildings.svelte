<script module lang="ts">
	import { getLowerManhattanBuildings } from '$lib/geo.remote.js';
	const buildings = await getLowerManhattanBuildings();
</script>

<script lang="ts">
	import { Chart, GeoPath, Light, WebGL, Tooltip, perspective } from '@layerchart/webgl';
	import { geoMercator } from 'd3-geo';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import { pixelsPerMeter } from '$lib/utils/elevation.js';

	let azimuth = $state(220);
	let altitude = $state(35);
	let shadow = $state(true);

	// Lower Manhattan's buildings from OpenStreetMap (© OpenStreetMap contributors, ODbL)

	/** Untagged buildings stand at a typical few floors */
	const height = (d: any) => d.properties.height ?? 12;

	const data = buildings;
	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
	<RangeField label="Sun azimuth" bind:value={azimuth} min={0} max={360} step={5} />
	<RangeField label="Sun altitude" bind:value={altitude} min={5} max={90} step={1} />
	<Field label="Shadows">
		<Switch bind:checked={shadow} />
	</Field>
</div>

<Chart
	view={perspective({ rotate: -30, tilt: 55 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	geo={{ projection: geoMercator, fitGeojson: buildings }}
	zDomain={[0, 420]}
	zRange={({ width, height }) => [
		0,
		// Meters to pixels at the map's scale, so towers stand as tall as they are wide
		420 * pixelsPerMeter(geoMercator().fitSize([width, height], buildings), [-74.01, 40.708])
	]}
	tooltipContext
	height={600}
>
	<WebGL>
		<Light {azimuth} {altitude} intensity={1.1} {shadow} />
		<Light type="ambient" intensity={0.5} />
		<GeoPath
			tooltip
			geojson={buildings}
			z={height}
			fill="color-mix(in oklab, var(--color-surface-content) 12%, var(--color-surface-100))"
		/>
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header>{data.properties.name ?? 'Building'}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="Height (m)" value={data.properties.height ?? '—'} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
