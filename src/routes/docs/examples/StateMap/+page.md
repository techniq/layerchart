---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { geoAlbersUsa, geoAlbers, geoEqualEarth, geoEquirectangular, geoMercator, geoNaturalEarth1, geoOrthographic } from 'd3-geo';
	import { index } from 'd3-array';
	import { scaleQuantize } from 'd3-scale';
	import { feature } from 'topojson-client';

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
	import { Button, Field } from 'svelte-ux'

	import Preview from '$lib/docs/Preview.svelte';
	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import ClipPathUse from '$lib/components/ClipPathUse.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Graticule from '$lib/components/Graticule.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	export let data;

	const states = feature(data.geojson, data.geojson.objects.states);
	const stateNames = states.features.map(x => x.properties.name).sort();
	let selectedState = 'West Virginia';
	$: selectedStateFeature = states.features.find(f => f.properties.name === selectedState);
	const counties = feature(data.geojson, data.geojson.objects.counties);

	let projection = geoAlbersUsa;
	const projections = [
		{ name: 'Albers', value: geoAlbers },
		{ name: 'AlbersUsa', value: geoAlbersUsa },
		{ name: 'Equal Earth', value: geoEqualEarth },
		{ name: 'Equirectangular', value: geoEquirectangular },
		{ name: 'Mercator', value: geoMercator },
		{ name: 'Natural Earth', value: geoNaturalEarth1 },
		{ name: 'Orthographic', value: geoOrthographic },
	]
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,auto,auto] gap-2 my-2">
	<Field label="State" let:id>
		<select bind:value={selectedState} class="w-full outline-none appearance-none text-sm" {id}>
			{#each stateNames as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</Field>
		<Field label="Projections" let:id>
		<select bind:value={projection} class="w-full outline-none appearance-none text-sm" {id}>
			{#each projections as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
	</Field>
</div>

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection,
				geojson: selectedStateFeature,
			}}
			tooltip={{ mode: 'manual' }}
			let:tooltip
		>
			<Svg>
				<GeoPath geojson={selectedStateFeature} id="state" />
				<ClipPathUse id="state">
					{#each counties.features as feature}
						<GeoPath geojson={feature} class="fill-white stroke-black/10 hover:fill-gray-200" {tooltip} />
					{/each}
				</ClipPathUse>
			</Svg>
			<Tooltip header={(data) => data.properties.name} />
		</Chart>
	</div>
</Preview>
