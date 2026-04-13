<script lang="ts">
	import { defaultChartPadding, LineChart, Raster, Spline, Tooltip } from 'layerchart';
	import { Field, MenuField, Switch, TextField } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { evaluate } from 'mathjs';
	import { scaleSequential } from 'd3-scale';
	import { interpolateViridis } from 'd3-scale-chromatic';

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

	const formula = $derived(selected === 'custom' ? customFormula : selected);
	const { data, error } = $derived(computeGraph(formula));

	const rasterValue = $derived.by(() => {
		const f = formula;
		if (!f?.trim()) return (_x: number, _y: number) => 0;
		return (x: number, _y: number) => {
			try {
				const y = evaluate(f, { x });
				return isFinite(y) ? y : NaN;
			} catch {
				return NaN;
			}
		};
	});

	function computeGraph(formula: string) {
		if (!formula?.trim()) return { data: [], error: null };

		try {
			const data = xs.flatMap((x) => {
				try {
					const y = evaluate(formula, { x });
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

<div class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
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
	<Field label="Raster">
		<Switch bind:checked={showRaster} />
	</Field>
</div>

<LineChart
	{data}
	x="x"
	y="y"
	cScale={showRaster ? scaleSequential(interpolateViridis) : undefined}
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
