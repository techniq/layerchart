---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { spring } from 'svelte/motion';
	import { geoOrthographic } from 'd3-geo';
	import { index } from 'd3-array';
	import { scaleQuantize } from 'd3-scale';
	import { feature } from 'topojson-client';

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
	import { Button, Field } from 'svelte-ux'

	import Preview from '$lib/docs/Preview.svelte';
	import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
	import GeoPath from '$lib/components/GeoPath.svelte';
	import Graticule from '$lib/components/Graticule.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';
	
	// TODO: Add SVG versoin with country clicking - https://observablehq.com/@benjamesdavis/orthopgragic-map

	export let data;

	const geojson = feature(data.geojson, data.geojson.objects.countries);

	const springOptions = { stiffness: .04 }

	const yaw = spring(0, springOptions);
	const pitch = spring(0, springOptions);
	const roll = spring(0, springOptions);
</script>

<Button on:click={() => { $yaw = -20; $pitch = 0 }}>Africa</Button>
<Button on:click={() => { $yaw = 0; $pitch = 90 }}>Antarctica</Button>
<Button on:click={() => { $yaw = -140; $pitch = 25 }}>Australia</Button>
<Button on:click={() => { $yaw = -100; $pitch = -30 }}>China</Button>
<Button on:click={() => { $yaw = -10; $pitch = -45 }}>Europe</Button>
<Button on:click={() => { $yaw = -140; $pitch = -30 }}>Japan</Button>
<Button on:click={() => { $yaw = -80; $pitch = -20 }}>India</Button>
<Button on:click={() => { $yaw = 0; $pitch = -95 }}>North pole</Button>
<Button on:click={() => { $yaw = 60; $pitch = 25 }}>South America</Button>
<Button on:click={() => { $yaw = 100; $pitch = -30 }}>United States</Button>
<Button on:click={() => { $yaw = 0; $pitch = 0; $roll = 0 }}>Reset</Button>

<Preview>
	<div class="h-[600px]">
		<Chart
			geo={{
				projection: geoOrthographic,
				geojson,
				rotate: {
					yaw: $yaw,
					pitch: $pitch,
					roll: $roll
				}
			}}
		>
			<Canvas>
				<GeoPath geojson={{ type: 'Sphere' }} fill="#93c5fd" />
			</Canvas>
			<Canvas>
				<Graticule stroke="rgba(0,0,0,.20)" />
			</Canvas>
			<Canvas>
				<GeoPath {geojson} fill="white"/>
			</Canvas>
		</Chart>
	</div>
</Preview>
