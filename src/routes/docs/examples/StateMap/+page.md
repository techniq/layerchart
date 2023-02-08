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
	import ChartClipPath from '$lib/components/ChartClipPath.svelte';
	import ClipPathUse from '$lib/components/ClipPathUse.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Graticule from '$lib/components/Graticule.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	export let data;

	const counties = feature(data.geojson, data.geojson.objects.counties);
	const states = feature(data.geojson, data.geojson.objects.states);
	const stateNames = states.features.map(x => x.properties.name).sort();
	let selectedState = 'West Virginia';
	$: selectedStateFeature = states.features.find(f => f.properties.name === selectedState);
	$: selectedCountiesFeatures = counties.features.filter(f => f.id.slice(0,2) === selectedStateFeature.id);

	let projection = geoAlbersUsa;
	const projections = [
		{ name: 'Albers', value: geoAlbers },
		{ name: 'AlbersUsa', value: geoAlbersUsa },
		{ name: 'Mercator', value: geoMercator },
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

## State only

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection,
				geojson: selectedStateFeature,
			}}
		>
			<Svg>
				<GeoPath geojson={selectedStateFeature} />
			</Svg>
		</Chart>
	</div>
</Preview>

## State with counties

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
				{#each selectedCountiesFeatures as feature}
					<GeoPath geojson={feature} class="fill-white stroke-black/10 hover:fill-gray-200" {tooltip} />
				{/each}
				<GeoPath geojson={selectedStateFeature} class="fill-none pointer-events-none" />
			</Svg>
			<Tooltip header={(data) => data.properties.name} />
		</Chart>
	</div>
</Preview>

## State with surrounding states (via ChartClipPath)

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
				<ChartClipPath>
					{#each counties.features as feature}
						<GeoPath geojson={feature} class="fill-white stroke-black/5 hover:fill-gray-200" {tooltip} />
					{/each}
					{#each states.features as feature}
						<GeoPath geojson={feature} class="fill-none pointer-events-none stroke-black/10" />
					{/each}
					<GeoPath geojson={selectedStateFeature} class="fill-none pointer-events-none" />
				</ChartClipPath>
			</Svg>
			<Tooltip header={(data) => data.properties.name} />
		</Chart>
	</div>
</Preview>
