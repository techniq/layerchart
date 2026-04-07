<script lang="ts">
	import { geoOrthographic } from 'd3-geo';

	import { Chart, GeoPath, GeoRaster, Graticule, Layer } from 'layerchart';
	import { SelectField } from 'svelte-ux';

	// Equirectangular planetary surface maps sourced from Solar System Scope
	// (https://www.solarsystemscope.com/textures) — CC BY 4.0.
	const planets = [
		{ label: 'Earth', value: '/images/blue-marble.jpg' },
		{ label: 'Moon', value: '/images/planets/moon.jpg' },
		{ label: 'Mars', value: '/images/planets/mars.jpg' },
		{ label: 'Mercury', value: '/images/planets/mercury.jpg' },
		{ label: 'Venus', value: '/images/planets/venus_surface.jpg' },
		{ label: 'Jupiter', value: '/images/planets/jupiter.jpg' },
		{ label: 'Saturn', value: '/images/planets/saturn.jpg' },
		{ label: 'Uranus', value: '/images/planets/uranus.jpg' },
		{ label: 'Neptune', value: '/images/planets/neptune.jpg' }
	];

	let planet = $state(planets[0].value);
</script>

<div class="mb-4 screenshot-hidden">
	<SelectField
		label="Planet"
		options={planets}
		bind:value={planet}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>

<Chart
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
