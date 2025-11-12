<script lang="ts">
	import {
		geoAlbersUsa,
		geoAlbers,
		geoEqualEarth,
		geoEquirectangular,
		geoMercator,
		geoNaturalEarth1,
		geoOrthographic,
		geoStereographic,
		geoGnomonic
	} from 'd3-geo';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Graticule, Layer, Tooltip } from 'layerchart';
	import { Field, RangeField, SelectField } from 'svelte-ux';
	import { getCountriesTopology } from '$lib/geo.remote';

	let config = $state({
		stepX: 10,
		stepY: 10,
		projection: geoOrthographic,
		rotate: {
			yaw: 0,
			pitch: -30,
			roll: 20
		},
		scale: 0
	});

	const projections = [
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Orthographic', value: geoOrthographic },
		{ label: 'Stereographic', value: geoStereographic },
		{ label: 'Gnomonic', value: geoGnomonic }
	];

	const topology = $derived(await getCountriesTopology());
	const geojson = $derived(feature(topology, topology.objects.countries));

	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2">
	<SelectField
		label="Projections"
		options={projections}
		bind:value={config.projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>
<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2">
	<RangeField label="Yaw" bind:value={config.rotate.yaw} min={-360} max={360} />
	<RangeField label="Pitch" bind:value={config.rotate.pitch} min={-90} max={90} />
	<RangeField label="Roll" bind:value={config.rotate.roll} min={-180} max={180} />
</div>
<div class="grid grid-cols-2 gap-2 my-2">
	<RangeField label="Step X" bind:value={config.stepX} min={0} max={180} />
	<RangeField label="Step Y" bind:value={config.stepY} min={0} max={180} />
</div>

<Chart
	geo={{
		projection: config.projection,
		fitGeojson: geojson,
		rotate: config.rotate
	}}
	padding={{ top: 10, bottom: 10 }}
	height={600}
>
	{#snippet children({ context })}
		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content" />
			<Graticule
				stepX={config.stepX}
				stepY={config.stepY}
				class="stroke-surface-content/20 pointer-events-none"
			/>
		</Layer>

		<Tooltip.Root>
			{context.tooltip.data?.properties.name}
		</Tooltip.Root>
	{/snippet}
</Chart>
