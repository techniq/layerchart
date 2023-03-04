---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { spring } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { geoOrthographic, geoCentroid } from 'd3-geo';
	import { index } from 'd3-array';
	import { feature } from 'topojson-client';

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
	import { Button, Field, ToggleGroup, ToggleOption, Switch, scrollIntoView } from 'svelte-ux'
	import { cls } from 'svelte-ux/utils/styles';
	import { createPropertySortFunc, createSortFunc } from 'svelte-ux/utils/sort';

	import GeoDebug from '$lib/docs/GeoDebug.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Graticule from '$lib/components/Graticule.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';
	import Zoom from '$lib/components/Zoom.svelte';
	
	export let data;

	const countries = feature(data.geojson, data.geojson.objects.countries);

	let scale = 0;
	let yaw = 0;
	let pitch = 0;
	let roll = 0;
	let sensitivity = 75;

	let zoom;
	let scrollMode = 'scale';
	let debug = false;
</script>

## SVG

<div class="grid grid-cols-[auto,1fr] gap-2 my-2">
	<Field label="Debug" let:id>
		<Switch bind:checked={debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[600px] overflow-hidden">
		<Chart
			geo={{
				projection: geoOrthographic,
				_fitGeojson: countries,
				rotate: {
					yaw,
					pitch,
					roll
				},
				_scale: scale,
				translate: [480, 300]
			}}
			let:projection
		>
			{#if debug}
				<GeoDebug class="absolute top-0 left-0 z-10" />
			{/if}
			<Svg>
				<Zoom
					mode="manual"
					_initialScale={projection.scale()}
					_initialTranslate={{ x: projection.translate()[0], y: projection.translate()[1] }}
					bind:this={zoom}
					scroll="scale"
					tweened={{ duration: 800, easing: cubicOut }}
					let:zoomTo
					let:reset={resetZoom}
					on:zoom={(e) => {
						//scale = e.detail.scale;
						const scale = 250;
						yaw = e.detail.translate.x * (sensitivity / scale);
						pitch = -e.detail.translate.y * (sensitivity / scale)
					}}
				>
					<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-300" on:click={() => yaw += 1} />
					<Graticule class="stroke-black/20 fill-none pointer-events-none" />
					{#each countries.features as country}
						<GeoPath geojson={country} class="fill-white pointer-events-none" />
					{/each}
				</Zoom>
			</Svg>
		</Chart>
	</div>
</Preview>
