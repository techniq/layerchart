<script lang="ts">
	import { defaultChartPadding, LineChart, Raster, Spline, Tooltip } from 'layerchart';
	import { Field, MenuField, Switch, TextField } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { browser } from '$app/environment';
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

	const options = [
		{ label: 'x²', value: 'x^2' },
		{ label: 'log(x)', value: 'log(x)' },
		{ label: '(x²-4)/(x-2)', value: '(x^2-4)/(x-2)' },
		{ label: '2ˣ', value: '2^x' },
		{ label: 'x³ - 2x', value: 'x^3 - 2*x' },
		{ label: 'sin(x)', value: 'sin(x)' },
		{ label: 'sqrt(x)', value: 'sqrt(x)' },
		{ label: 'abs(x) - 3', value: 'abs(x) - 3' },
		{ label: 'Custom', value: 'custom' }
	];

	const xs = Array.from({ length: 100 }, (_, i) => -8 + i * 0.2);
	let selected = $state('x^2');
	let customFormula = $state('');
	let showRaster = $state(false);
	let evaluateFn: ((expr: string, scope?: object) => any) | null = $state(null);

	$effect(() => {
		if (browser) {
			import('mathjs').then((m) => {
				evaluateFn = m.evaluate;
			});
		}
	});

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
	let selectedInterp = $state('viridis');
	let interp = $derived(interpolators.find((i) => i.value === selectedInterp)!);

	const formula = $derived(selected === 'custom' ? customFormula : selected);
	const { data, error } = $derived(computeGraph(formula, evaluateFn));

	const rasterValue = $derived.by(() => {
		const f = formula;
		const eval_ = evaluateFn;
		if (!f?.trim() || !eval_) return (_x: number, _y: number) => 0;
		return (x: number, _y: number) => {
			try {
				const y = eval_(f, { x });
				return isFinite(y) ? y : NaN;
			} catch {
				return NaN;
			}
		};
	});

	function computeGraph(formula: string, eval_: typeof evaluateFn) {
		if (!formula?.trim() || !eval_) return { data: [], error: null };

		try {
			const data = xs.flatMap((x) => {
				try {
					const y = eval_(formula, { x });
					return isFinite(y) && Math.abs(y) < 1e6 ? [{ x, y }] : [];
				} catch {
					return [];
				}
			});
			return data.length === 0
				? { data: [], error: 'No valid points — check domain' }
				: { data, error: null };
		} catch (err) {
			return {
				data: [],
				error: err instanceof Error ? err.message : String(err)
			};
		}
	}
</script>

<div class="grid gap-2 mb-4">
	<div class="grid grid-cols-[1fr_1fr] gap-2">
		<MenuField
			label="Formula"
			{options}
			bind:value={selected}
			stepper
			classes={{ menuIcon: 'hidden' }}
		/>
		<TextField
			label="Custom"
			bind:value={customFormula}
			placeholder="e.g. tan(x) or x^3 - x"
			error={selected === 'custom' && customFormula && error ? error : false}
			disabled={selected !== 'custom'}
			onfocusin={() => (selected = 'custom')}
		/>
	</div>
	<div class="grid grid-cols-[auto_1fr] gap-2">
		<Field label="Raster">
			<Switch bind:checked={showRaster} />
		</Field>
		<MenuField
			label="Color"
			options={interpolators}
			bind:value={selectedInterp}
			disabled={!showRaster}
			stepper
			classes={{ menuIcon: 'hidden' }}
		/>
	</div>
</div>

<LineChart
	{data}
	x="x"
	y="y"
	cScale={showRaster ? scaleSequential(interp.fn) : undefined}
	props={{
		yAxis: {
			rule: true
		}
	}}
	clip
	yNice
	height={400}
	padding={defaultChartPadding({ left: 45, right: 45 })}
>
	{#snippet marks({ context })}
		{#if showRaster}
			<Raster value={rasterValue} opacity={0.5} />
		{/if}
		{#each context.series.visibleSeries as s (s.key)}
			<Spline seriesKey={s.key} />
		{/each}
	{/snippet}
	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.List>
					<Tooltip.Item label="x" value={format(context.x(data), 'decimal')} />
					<Tooltip.Item label="y" value={format(context.y(data), 'decimal')} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
