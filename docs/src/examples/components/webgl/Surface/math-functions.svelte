<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import {
		interpolateRainbow,
		interpolateSinebow,
		interpolateWarm,
		interpolateCool,
		interpolateInferno,
		interpolateViridis,
		interpolateMagma,
		interpolateTurbo,
		interpolateCividis,
		interpolateYlGnBu,
		interpolateSpectral,
		interpolatePlasma,
		interpolateCubehelixDefault,
		interpolateRdYlBu
	} from 'd3-scale-chromatic';
	import { Axis, Chart, WebGL, Surface, perspective } from '@layerchart/webgl';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { Field, MenuField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

	const functions = [
		{
			label: 'atan2(y, x)',
			value: 'atan2',
			fn: (x: number, y: number) => Math.atan2(y, x)
		},
		{
			label: 'sin(x) * cos(y)',
			value: 'sincos',
			fn: (x: number, y: number) => Math.sin(x * Math.PI * 2) * Math.cos(y * Math.PI * 2)
		},
		{
			label: 'sin(x² + y²)',
			value: 'ripples',
			fn: (x: number, y: number) => Math.sin((x * x + y * y) * Math.PI * 6)
		},
		{
			label: 'x² - y²',
			value: 'saddle',
			fn: (x: number, y: number) => x * x - y * y
		},
		{
			label: 'sin(x * y)',
			value: 'sinxy',
			fn: (x: number, y: number) => Math.sin(x * y * Math.PI * 4)
		},
		{
			label: 'cos(r * 5π)',
			value: 'rings',
			fn: (x: number, y: number) => Math.cos(Math.sqrt(x * x + y * y) * Math.PI * 5)
		}
	];

	const interpolators = [
		{ label: 'Viridis', value: 'viridis', fn: interpolateViridis },
		{ label: 'Inferno', value: 'inferno', fn: interpolateInferno },
		{ label: 'Magma', value: 'magma', fn: interpolateMagma },
		{ label: 'Plasma', value: 'plasma', fn: interpolatePlasma },
		{ label: 'Cividis', value: 'cividis', fn: interpolateCividis },
		{ label: 'Turbo', value: 'turbo', fn: interpolateTurbo },
		{ label: 'Rainbow', value: 'rainbow', fn: interpolateRainbow },
		{ label: 'Sinebow', value: 'sinebow', fn: interpolateSinebow },
		{ label: 'Warm', value: 'warm', fn: interpolateWarm },
		{ label: 'Cool', value: 'cool', fn: interpolateCool },
		{ label: 'Cubehelix', value: 'cubehelix', fn: interpolateCubehelixDefault },
		{ label: 'YlGnBu', value: 'ylgnbu', fn: interpolateYlGnBu },
		{ label: 'Spectral', value: 'spectral', fn: interpolateSpectral },
		{ label: 'RdYlBu', value: 'rdylbu', fn: interpolateRdYlBu }
	];

	let selectedFn = $state(functions[1].value);
	let selectedInterp = $state('viridis');
	let fn = $derived(functions.find((f) => f.value === selectedFn)!);
	let interp = $derived(interpolators.find((i) => i.value === selectedInterp)!);
	let style = $state<'flat' | 'raised'>('raised');
	let showContours = $state(false);
	// Flat to raised eases the `z` range, so the surface (and its contours) rise and fall
	const raised = Tween.of(() => (style === 'raised' ? 1 : 0), {
		duration: 800,
		easing: cubicInOut
	});
</script>

<div class="grid gap-2">
	<div class="grid grid-cols-[1fr_1fr_auto_auto] gap-2">
		<MenuField
			label="Function"
			options={functions}
			bind:value={selectedFn}
			stepper
			classes={{ menuIcon: 'hidden' }}
		/>
		<MenuField
			label="Color"
			options={interpolators}
			bind:value={selectedInterp}
			stepper
			classes={{ menuIcon: 'hidden' }}
		/>
		<Field label="Style">
			<ToggleGroup bind:value={style} variant="outline">
				<ToggleOption value="flat">Flat</ToggleOption>
				<ToggleOption value="raised">Raised</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Contours">
			<Switch bind:checked={showContours} />
		</Field>
	</div>

	<Chart
		view={perspective({ rotate: -30, tilt: 55 })}
		transform={{
			mode: 'canvas',
			drag: 'rotate',
			scrollMode: 'scale',
			scrollActivationKey: 'shift'
		}}
		cScale={scaleSequential(interp.fn)}
		xDomain={[-1, 1]}
		yDomain={[-1, 1]}
		zRange={({ height }) => [0, height * 0.3 * raised.current]}
		height={450}
	>
		<WebGL>
			<Axis placement="bottom" label="x" />
			<Axis placement="left" label="y" />
			<!-- `motion` morphs one function into the next -->
			<Surface
				value={fn.fn}
				pixelSize={4}
				contours={showContours ? 20 : undefined}
				motion={{ type: 'tween', duration: 800, easing: cubicInOut }}
			/>
		</WebGL>
	</Chart>
</div>
