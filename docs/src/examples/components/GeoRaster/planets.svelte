<script lang="ts">
	import { geoOrthographic } from 'd3-geo';

	import { Chart, GeoPath, GeoRaster, Graticule, Layer, type ChartState } from 'layerchart';
	import { Button, ButtonGroup, Field, RangeField, SelectField } from 'svelte-ux';
	import { TimerState } from '@layerstack/svelte-state';

	// Equirectangular planetary surface maps sourced from Solar System Scope
	// (https://www.solarsystemscope.com/textures) — CC BY 4.0.
	const planets = [
		{ label: 'Mercury', value: '/images/planets/mercury.jpg' },
		{ label: 'Venus', value: '/images/planets/venus_surface.jpg' },
		{ label: 'Earth', value: '/images/blue-marble.jpg' },
		{ label: 'Moon', value: '/images/planets/moon.jpg' },
		{ label: 'Mars', value: '/images/planets/mars.jpg' },
		{ label: 'Jupiter', value: '/images/planets/jupiter.jpg' },
		{ label: 'Saturn', value: '/images/planets/saturn.jpg' },
		{ label: 'Uranus', value: '/images/planets/uranus.jpg' },
		{ label: 'Neptune', value: '/images/planets/neptune.jpg' }
	];

	let planet = $state(planets.find((p) => p.label === 'Jupiter')!.value);

	let context = $state<ChartState>();
	let velocity = $state(3);

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
</script>

<div class="flex gap-4 items-center mb-4 screenshot-hidden">
	<SelectField
		label="Planet"
		options={planets}
		bind:value={planet}
		clearable={false}
		toggleIcon={null}
		stepper
		classes={{ root: 'w-60' }}
	/>

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
		class="flex-1"
	/>
</div>

<Chart
	bind:context
	geo={{
		projection: geoOrthographic,
		fitGeojson: { type: 'Sphere' }
	}}
	transform={{
		mode: 'projection',
		constrain: ({ scale, translate }) => ({
			scale,
			translate: {
				x: translate.x,
				y: Math.max(-90, Math.min(90, translate.y))
			}
		})
	}}
	ondragstart={timer.stop}
	padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
	height={500}
>
	<Layer type="canvas">
		<GeoRaster image={planet} interpolate="bilinear" />
	</Layer>
	<Layer type="svg">
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-none stroke-surface-content/30" />
		<Graticule class="stroke-surface-content/10" />
	</Layer>
</Chart>
