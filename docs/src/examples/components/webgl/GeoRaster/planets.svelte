<script lang="ts">
	import { Chart, GeoRaster, Light, WebGL, globe, perspective } from '@layerchart/webgl';
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

	// Spinning turns the view.  A drag hands its angles back (`onTransform`), so the timer carries
	// on from wherever it's dragged to
	let rotate = $state(0);
	let tilt = $state(80);
	let velocity = $state(0.5);
	let dragging = false;

	const timer = new TimerState({
		delay: 16,
		tick: () => {
			rotate = ((rotate - velocity + 540) % 360) - 180;
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
		min={0.1}
		max={3}
		step={0.1}
		labelPlacement="left"
	/>
</div>

<Chart
	padding={24}
	geo={{ projection: globe, fitGeojson: { type: 'Sphere' } }}
	view={perspective({ rotate, tilt })}
	transform={{
		mode: 'canvas',
		drag: 'rotate',
		scrollMode: 'scale',
		scrollActivationKey: 'shift',
		// Zoom in no further than the camera stays outside the globe
		scaleExtent: [0.5, 3],
		// Tip on round to the south pole, rather than stopping edge on
		tiltExtent: [0, 180]
	}}
	onTransform={({ rotation }) => {
		if (!dragging || !rotation) return;
		rotate = rotation.x;
		tilt = rotation.y;
	}}
	ondragstart={() => (dragging = true)}
	ondragend={() => (dragging = false)}
	height={500}
>
	<WebGL>
		<!-- Lit from one side, as the sun would -->
		<Light azimuth={250} altitude={20} intensity={1.1} />
		<Light type="ambient" intensity={0.25} />
		<GeoRaster src={planet} />
	</WebGL>
</Chart>
