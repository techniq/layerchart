---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { geoAlbersUsa, geoAlbers, geoMercator } from 'd3-geo';
	import { sort } from 'd3-array';
	import { feature } from 'topojson-client';

	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux'

	import Preview from '$lib/docs/Preview.svelte';
	import ZoomControls from '$lib/docs/ZoomControls.svelte';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	export let data;

	let projection = geoAlbersUsa;
	const projections = [
		{ name: 'Albers', value: geoAlbers },
		{ name: 'Albers USA', value: geoAlbersUsa },
		{ name: 'Mercator', value: geoMercator },
	];

	const counties = feature(data.geojson, data.geojson.objects.counties);
	const states = feature(data.geojson, data.geojson.objects.states);

	function filterNonStates(features) {
		return features.filter(x => Number(x.id) < 60)
	}

	let selectedStateId = null;
	$: selectedCountiesFeatures = selectedStateId ? counties.features.filter(f => f.id.slice(0,2) === selectedStateId) : [];

	let zoom;
	let scrollMode = 'scale';
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,auto,auto] gap-2 my-2">
	<Field label="Projection" let:id>
		<select bind:value={projection} class="w-full outline-none appearance-none text-sm" {id}>
			{#each projections as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
	</Field>
	<Field label="Scroll mode" let:id>
		<ToggleGroup bind:value={scrollMode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">None</ToggleOption>
			<ToggleOption value="scale">Scale</ToggleOption>
			<ToggleOption value="translate">Translate</ToggleOption>
		</ToggleGroup>
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
				fitGeojson: states,
			}}
			tooltip={{ mode: 'manual' }}
			let:tooltip
		>
			<Svg>
				<Zoom bind:this={zoom} scroll={scrollMode} tweened={{ duration: 800, easing: cubicOut }} let:zoomTo let:reset={resetZoom} let:scale>
					{#each filterNonStates(states.features) as feature}
						<GeoPath
							geojson={feature}
							class="fill-white hover:fill-gray-200"
							stroke-width={1 / scale}
							{tooltip}
							on:click={e => {
								const { geoPath, event } = e.detail;
								let [[left, top], [right, bottom]] = geoPath.bounds(feature);
								if (selectedStateId === feature.id) {
									selectedStateId = null;
									resetZoom();
								} else {
									selectedStateId = feature.id;
									let width = right - left;
									let height = bottom - top;
									let x = (left + right) / 2;
									let y = (top + bottom) / 2;
									const padding = 20;
									zoomTo({ x, y }, { width: width + padding, height: height + padding })
								}
							}}
						/>
					{/each}
					{#each selectedCountiesFeatures as feature (feature.id)}
						<g in:fade={{ duration: 300, delay: 600 }} out:fade={{ duration: 300 }}>
							<GeoPath geojson={feature} {tooltip} stroke-width={1 / scale} class="fill-white stroke-black/10 hover:fill-gray-200" on:click={() => {
									selectedStateId = null;
									resetZoom();
							}} />
						</g>
					{/each}
				</Zoom>
			</Svg>
			<Tooltip header={(data) => data.properties.name} />
		</Chart>
	</div>
</Preview>
