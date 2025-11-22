<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { curveCatmullRomClosed } from 'd3-shape';
	import { feature } from 'topojson-client';
	import { presimplify, simplify } from 'topojson-simplify';

	import { Chart, GeoPath, Graticule, Layer, type ChartContextValue } from 'layerchart';
	import GeoPathGlobeControls2 from '$lib/components/controls/GeoPathGlobeControls2.svelte';
	import { TimerState } from '@layerstack/svelte-state';

	import { getCountriesTopology } from '$lib/geo.remote.js';

	const topology = await getCountriesTopology();
	let curve = $state(curveCatmullRomClosed);
	let minArea = $state(2);
	let context = $state<ChartContextValue>(null!);
	let velocity = $state(1);

	const simplifiedGeojson = $derived(simplify(presimplify(topology), Math.pow(10, 2 - minArea)));
	const land = $derived(feature(simplifiedGeojson, topology.objects.land));

	const timer = new TimerState({
		delay: 1,
		tick: () => {
			if (!context) return;
			const curr = context.transform.translate;

			context.transform.translate = {
				x: (curr.x += velocity),
				y: curr.y
			};
		},
		disabled: true
	});

	const data = { topology, land };
	export { data };
</script>

<GeoPathGlobeControls2 {timer} bind:curve bind:minArea bind:velocity />

<Chart
	geo={{
		projection: geoOrthographic,
		fitGeojson: land,
		applyTransform: ['rotate']
	}}
	ondragstart={timer.stop}
	bind:context
	height={600}
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" />
		<Graticule class="stroke-surface-content/20" />
		<GeoPath geojson={land} {curve} class="stroke-surface-content/50 fill-white" />
	</Layer>
</Chart>
