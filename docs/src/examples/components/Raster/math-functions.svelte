<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateRainbow, interpolateSinebow, interpolateCool, interpolateInferno, interpolateViridis, interpolateTurbo, interpolateYlGnBu, interpolateSpectral, interpolatePlasma, interpolateCubehelixDefault } from 'd3-scale-chromatic';
	import { Axis, Chart, Layer, Raster } from 'layerchart';
	import { MenuField } from 'svelte-ux';

	const functions = [
		{
			label: 'atan2(y, x)',
			value: 'atan2',
			fn: (x: number, y: number) => Math.atan2(y, x),
		},
		{
			label: 'sin(x) * cos(y)',
			value: 'sincos',
			fn: (x: number, y: number) => Math.sin(x * Math.PI * 2) * Math.cos(y * Math.PI * 2),
		},
		{
			label: 'sin(x² + y²)',
			value: 'ripples',
			fn: (x: number, y: number) => Math.sin((x * x + y * y) * Math.PI * 6),
		},
		{
			label: 'x² - y²',
			value: 'saddle',
			fn: (x: number, y: number) => x * x - y * y,
		},
		{
			label: 'sin(x * y)',
			value: 'sinxy',
			fn: (x: number, y: number) => Math.sin(x * y * Math.PI * 4),
		},
		{
			label: 'cos(r * 5π)',
			value: 'rings',
			fn: (x: number, y: number) => Math.cos(Math.sqrt(x * x + y * y) * Math.PI * 5),
		},
	];

	const interpolators = [
		{ label: 'Rainbow', value: 'rainbow', fn: interpolateRainbow },
		{ label: 'Sinebow', value: 'sinebow', fn: interpolateSinebow },
		{ label: 'Turbo', value: 'turbo', fn: interpolateTurbo },
		{ label: 'Viridis', value: 'viridis', fn: interpolateViridis },
		{ label: 'Inferno', value: 'inferno', fn: interpolateInferno },
		{ label: 'Plasma', value: 'plasma', fn: interpolatePlasma },
		{ label: 'Cool', value: 'cool', fn: interpolateCool },
		{ label: 'YlGnBu', value: 'ylgnbu', fn: interpolateYlGnBu },
		{ label: 'Spectral', value: 'spectral', fn: interpolateSpectral },
		{ label: 'Cubehelix', value: 'cubehelix', fn: interpolateCubehelixDefault },
	];

	let selectedFn = $state(functions[0].value);
	let selectedInterp = $state(interpolators[0].value);
	let fn = $derived(functions.find((f) => f.value === selectedFn)!);
	let interp = $derived(interpolators.find((i) => i.value === selectedInterp)!);
</script>

<div class="grid gap-2">
	<div class="grid grid-cols-2 gap-2">
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
	</div>

	<Chart
		cScale={scaleSequential(interp.fn)}
		xDomain={[-1, 1]}
		yDomain={[-1, 1]}
		padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
		height={400}
	>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Raster value={fn.fn} />
		</Layer>
	</Chart>
</div>
