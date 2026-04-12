<script module lang="ts">
	import { getCountriesTopology } from '$lib/geo.remote.js';
	const topology = await getCountriesTopology();
</script>

<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import {
		geoProjection,
		geoEquirectangularRaw,
		geoMercatorRaw,
		geoNaturalEarth1Raw,
		geoEqualEarthRaw,
		geoOrthographicRaw,
		geoStereographicRaw,
		geoGnomonicRaw,
		type GeoRawProjection
	} from 'd3-geo';
	import {
		geoAitoffRaw,
		geoAugustRaw,
		geoBakerRaw,
		geoBoggsRaw,
		geoBromleyRaw,
		geoCollignonRaw,
		geoCrasterRaw,
		geoEckert1Raw,
		geoEckert3Raw,
		geoEckert5Raw,
		geoFaheyRaw,
		geoKavrayskiy7Raw,
		geoLarriveeRaw,
		geoMillerRaw,
		geoNaturalEarth2Raw,
		geoPattersonRaw,
		geoRobinsonRaw,
		geoSinusoidalRaw,
		geoTimesRaw,
		geoVanDerGrintenRaw,
		geoWiechelRaw,
		geoWinkel3Raw
	} from 'd3-geo-projection';
	import { feature } from 'topojson-client';

	import { Chart, GeoPath, Graticule, Layer } from 'layerchart';
	import { Button, ButtonGroup, Field, RangeField, SelectField, Switch } from 'svelte-ux';
	const land = feature(topology, topology.objects.land);

	const projections = [
		{ label: 'Aitoff', value: geoAitoffRaw },
		{ label: 'August', value: geoAugustRaw },
		{ label: 'Baker', value: geoBakerRaw },
		{ label: 'Boggs', value: geoBoggsRaw },
		{ label: 'Bromley', value: geoBromleyRaw },
		{ label: 'Collignon', value: geoCollignonRaw },
		{ label: 'Craster', value: geoCrasterRaw },
		{ label: 'Eckert I', value: geoEckert1Raw },
		{ label: 'Eckert III', value: geoEckert3Raw },
		{ label: 'Eckert V', value: geoEckert5Raw },
		{ label: 'Equal Earth', value: geoEqualEarthRaw },
		{ label: 'Equirectangular', value: geoEquirectangularRaw },
		{ label: 'Fahey', value: geoFaheyRaw },
		{ label: 'Gnomonic', value: geoGnomonicRaw },
		{ label: 'Kavrayskiy VII', value: geoKavrayskiy7Raw },
		{ label: 'Larrivee', value: geoLarriveeRaw },
		{ label: 'Mercator', value: geoMercatorRaw },
		{ label: 'Miller', value: geoMillerRaw },
		{ label: 'Natural Earth 1', value: geoNaturalEarth1Raw },
		{ label: 'Natural Earth 2', value: geoNaturalEarth2Raw },
		{ label: 'Orthographic', value: geoOrthographicRaw },
		{ label: 'Patterson', value: geoPattersonRaw },
		{ label: 'Robinson', value: geoRobinsonRaw },
		{ label: 'Sinusoidal', value: geoSinusoidalRaw },
		{ label: 'Stereographic', value: geoStereographicRaw },
		{ label: 'Times', value: geoTimesRaw },
		{ label: 'Van der Grinten', value: geoVanDerGrintenRaw },
		{ label: 'Wiechel', value: geoWiechelRaw },
		{ label: 'Winkel Tripel', value: geoWinkel3Raw }
	];

	const FRAMES = 480;

	let rawFrom: GeoRawProjection = $state(geoMercatorRaw as unknown as GeoRawProjection);
	let rawTo: GeoRawProjection = $state(geoOrthographicRaw as unknown as GeoRawProjection);
	let showGraticule = $state(true);
	let animating = $state(true);
	let currentFrame = $state(0);
	let manualT = $state(0);
	let scale = $state(150);

	// Ping-pong easing: 0 -> 1 -> 0 over 2*FRAMES
	const animatedT = $derived.by(() => {
		const frame = currentFrame % (FRAMES * 2);
		const phase = frame < FRAMES ? frame / FRAMES : 2 - frame / FRAMES;
		return cubicInOut(phase);
	});

	const t = $derived(animating ? animatedT : manualT);

	// Interpolated projection factory -- recreated each frame as t updates
	const projectionFactory = $derived.by(() => {
		const currentT = t;
		const r0 = rawFrom;
		const r1 = rawTo;
		return () => {
			const raw = (lambda: number, phi: number): [number, number] => {
				const [x0, y0] = r0(lambda, phi) as [number, number];
				const [x1, y1] = r1(lambda, phi) as [number, number];
				return [x0 + currentT * (x1 - x0), y0 + currentT * (y1 - y0)];
			};
			return geoProjection(raw).precision(0.1);
		};
	});

	// Animation loop
	$effect(() => {
		if (!animating) return;

		let rafId: number;
		function tick() {
			currentFrame++;
			rafId = requestAnimationFrame(tick);
		}
		rafId = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(rafId);
	});

	const data = { topology };
	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr] gap-2 mb-4 screenshot-hidden">
	<SelectField
		label="From"
		options={projections}
		bind:value={rawFrom}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<SelectField
		label="To"
		options={projections}
		bind:value={rawTo}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>
<div class="flex gap-4 items-center mb-4 screenshot-hidden">
	<Field label="Graticule" dense labelPlacement="left" let:id>
		<Switch {id} bind:checked={showGraticule} size="md" />
	</Field>
	<ButtonGroup size="sm" variant="fill-light">
		<Button on:click={() => (animating = true)} disabled={animating}>Play</Button>
		<Button on:click={() => (animating = false)} disabled={!animating}>Pause</Button>
	</ButtonGroup>
	<RangeField
		label="Blend"
		bind:value={manualT}
		min={0}
		max={1}
		step={0.001}
		disabled={animating}
		class="flex-1"
	/>
	<RangeField label="Scale" bind:value={scale} min={10} max={500} step={1} class="flex-1" />
</div>

<Chart
	geo={{
		projection: projectionFactory,
		scale
	}}
	height={800}
	clip
>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="stroke-surface-content/20 fill-none" />
		{#if showGraticule}
			<Graticule class="stroke-surface-content/10" />
		{/if}
		<GeoPath geojson={land} class="fill-surface-content/15" />
	</Layer>
</Chart>
