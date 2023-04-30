<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { index } from 'd3-array';
	import { scaleQuantize } from 'd3-scale';
	import { geoMercator, geoBounds, geoCentroid } from 'd3-geo';
	import { feature } from 'topojson-client';
	
	import { Button, Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import GeoDebug from '$lib/docs/GeoDebug.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import RangeField from '$lib/docs/RangeField.svelte';
	import TilesetField from '$lib/docs/TilesetField.svelte';
	import ZoomControls from '$lib/docs/ZoomControls.svelte';

	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import ClipPathUse from '$lib/components/ClipPathUse.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import GeoTile from '$lib/components/GeoTile.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	import geojson from '../_data/geo/us-states-topojson.js';

	const states = feature(geojson, geojson.objects.collection);

	$: filteredStates = { ...states, features: states.features.filter(d => d.properties.name !== 'Alaska' && d.properties.name !== 'Hawaii' )}
	// $: filteredStates = { ...states, features: states.features.filter(d => d.properties.name === 'West Virginia')}
	$: selectedFeature = filteredStates;

	let selectedStateName = null;
	let serviceUrl;
	let zoomDelta = 0;
	let zoom;
	let scrollMode = 'scale';
	let debug = false;

	let scale = 0;
	let translate = { x: 480, y: 300 }
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 my-2">
	<TilesetField bind:serviceUrl />
	<RangeField label="Zoom delta" bind:value={zoomDelta} min={-5} max={5} />
	<Field label="Scroll mode" let:id>
		<ToggleGroup bind:value={scrollMode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">None</ToggleOption>
			<ToggleOption value="scale">Scale</ToggleOption>
			<ToggleOption value="translate">Translate</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={debug} {id} />
	</Field>
</div>

# Examples

## SVG

<Preview>
	<div class="h-[600px] relative overflow-hidden">
		<ZoomControls {zoom} />
		<Chart
			geo={{
				projection: geoMercator,
				_fitGeojson: selectedFeature,
				scale,
				translate: [translate.x, translate.y]
			}}
			tooltip={{ mode: 'manual' }}
			let:tooltip
			let:projection
		>
			{#if debug}
				<GeoDebug class="absolute top-0 left-0 z-10" />
			{/if}
			<Svg>
				<Zoom
					mode="manual"
					translateOnScale
					initialScale={projection.scale()}
					initialTranslate={{ x: projection.translate()[0], y: projection.translate()[1] }}
					scroll={scrollMode}
					tweened={{ duration: 800, easing: cubicOut }}
					let:zoomTo
					let:reset={resetZoom}
					on:zoom={(e) => { scale = e.detail.scale, translate = e.detail.translate }}
					bind:this={zoom}
				>
					<GeoTile url={serviceUrl} {zoomDelta} {debug} />
					{#each filteredStates.features as feature}
						<GeoPath
							geojson={feature}
							class="stroke-none"
							{tooltip}
							on:click={e => {
								const { geoPath, event } = e.detail;
								console.log({ selectedStateName, feature })
								/*
								if (selectedStateName === feature.properties.name) {
									selectedStateName = null;
									resetZoom();
								} else {
								*/
									selectedStateName = feature.properties.name;
									// let [[left, top], [right, bottom]] = geoPath.bounds(feature);
									console.log(geoPath.bounds(feature));
									let [minLongLat, maxLongLat] = geoBounds(feature);
									// Convert lat/long to screen x/y
									const [left, top] = projection(minLongLat)
									const [right, bottom] = projection(maxLongLat)
									let width = right - left;
									let height = bottom - top;
									//let x = (left + right) / 2;
									//let y = (top + bottom) / 2;
									let x = (left + right) / 2 + projection.translate()[0];
									let y = (top + bottom) / 2 + projection.translate()[1];
									const padding = 20;
									//zoomTo({ x, y }, { width: width + padding, height: height + padding })
								//}
							}}
						/>
					{/each}
				</Zoom>
			</Svg>
			<Tooltip header={(data) => data.properties.name} let:data>
				{@const [longitude, latitude] = projection.invert([tooltip.left,tooltip.top])}
				<TooltipItem
					label="longitude"
					value={longitude}
					format="decimal"
				/>
				<TooltipItem
					label="latitude"
					value={latitude}
					format="decimal"
				/>
			</Tooltip>
		</Chart>
	</div>
</Preview>
