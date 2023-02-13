---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
	import { sort } from 'd3-array';
	import { scaleQuantize } from 'd3-scale';
	import { feature } from 'topojson-client';

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
	import { Button, Field } from 'svelte-ux'

	import Chart, { Canvas, Svg, Html } from '$lib/components/Chart.svelte';
	import ChartClipPath from '$lib/components/ChartClipPath.svelte';
	import ClipPathUse from '$lib/components/ClipPathUse.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Graticule from '$lib/components/Graticule.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import ZoomControls from '$lib/docs/ZoomControls.svelte';

	export let data;

	const counties = feature(data.geojson, data.geojson.objects.counties);
	const states = feature(data.geojson, data.geojson.objects.states);

	function filterNonStates(features) {
		return features.filter(x => Number(x.id) < 60)
	}

	const stateOptions = sort(filterNonStates(states.features).map(x => ({ name: x.properties.name, value: x.id })), d => d.value);
	let selectedStateId = '54'; // 'West Virginia';
	$: selectedStateFeature = states.features.find(f => f.id === selectedStateId);
	$: selectedCountiesFeatures = counties.features.filter(f => f.id.slice(0,2) === selectedStateId);

	let projection = geoAlbersUsa;
	const projections = [
		{ name: 'Albers', value: geoAlbers },
		{ name: 'AlbersUsa', value: geoAlbersUsa },
		{ name: 'Mercator', value: geoMercator },
	];

	let zoom;
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,auto,auto] gap-2 my-2">
	<!-- <Field label="State" let:id>
		<select bind:value={selectedStateId} class="w-full outline-none appearance-none text-sm" {id}>
			{#each stateOptions as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
	</Field> -->
	<Field label="Projection" let:id>
		<select bind:value={projection} class="w-full outline-none appearance-none text-sm" {id}>
			{#each projections as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
	</Field>
</div>

<Preview>
	<div class="h-[600px] relative overflow-hidden">
		<div class="absolute top-0 right-0 z-10">
			<ZoomControls {zoom} />
		</div>
		<Chart
			geo={{
				projection,
				geojson: states,
			}}
			tooltip={{ mode: 'manual' }}
			let:tooltip
		>
			<Svg>
				<Zoom bind:this={zoom} tweened={{ duration: 800, easing: cubicOut }} let:zoomTo let:scale>
					{#each filterNonStates(states.features) as feature}
						<GeoPath
							geojson={feature}
							class="fill-white hover:fill-gray-200"
							{tooltip}
							stroke-width={1 / scale.x}
							on:click={e => {
								const { geoPath, event } = e.detail;
								event.stopPropagation();
								//selectedStateId = feature.id
								let [[left, top], [right, bottom]] = geoPath.bounds(feature);
								let width = right - left;
								let height = bottom - top;
								let x = (left + right) / 2;
								let y = (top + bottom) / 2;
								//const scale = Math.max(width, height) * 1.2; // make x/y consistent to maintain aspect ratio.  Scale out slightly
								const scale = 300; // half of height
								zoomTo({ x, y }, { x: scale, y: scale })
							}}
						/>
					{/each}
					<!--
					{#each selectedCountiesFeatures as feature (feature.id)}
						<g transition:fade={{ duration: 300 }}>
							<GeoPath geojson={feature} class="fill-none stroke-black/10" />
						</g>
					{/each}
					-->
				</Zoom>
			</Svg>
			<Tooltip header={(data) => data.properties.name} />
		</Chart>
	</div>
</Preview>
