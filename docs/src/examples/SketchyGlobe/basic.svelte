<script lang="ts">
	import { geoOrthographic } from 'd3-geo';
	import { curveCatmullRomClosed } from 'd3-shape';
	import { feature } from 'topojson-client';
	import { presimplify, simplify } from 'topojson-simplify';

	import { Chart, GeoPath, Graticule, Layer, type ChartContextValue } from 'layerchart';
	import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
	import { TimerState } from '@layerstack/svelte-state';

	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import { getWorldGeojson } from '$lib/data.remote.js';

	const geojson = await getWorldGeojson();

	let curve = $state(curveCatmullRomClosed);
	let minArea = $state(2);

	const simplifiedGeojson = $derived(simplify(presimplify(geojson), Math.pow(10, 2 - minArea)));
	const land = $derived(feature(simplifiedGeojson, geojson.objects.land));

	let context = $state<ChartContextValue>(null!);

	let velocity = $state(1);
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

	const data = { geojson, land };

	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2">
	<CurveMenuField bind:value={curve} showOpenClosed />
	<RangeField label="Min area" bind:value={minArea} min={0} max={3} step={0.01} />
</div>
<div class="grid grid-cols-[1fr_auto] gap-2 items-end mb-4">
	<div class="mb-2 flex gap-6">
		<Field label="Spin:" dense labelPlacement="left">
			<ButtonGroup size="sm" variant="fill-light">
				<Button on:click={timer.start} disabled={timer.running}>Start</Button>
				<Button on:click={timer.stop} disabled={!timer.running}>Stop</Button>
			</ButtonGroup>
		</Field>

		<RangeField
			label="Velocity:"
			bind:value={velocity}
			min={-10}
			max={10}
			disabled={!timer.running}
			labelPlacement="left"
		/>
	</div>
</div>

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
