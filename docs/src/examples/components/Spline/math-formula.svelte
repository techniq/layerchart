<script lang="ts">
	import { defaultChartPadding, LineChart, Tooltip } from 'layerchart';
	import { Radio, TextField } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { evaluate } from 'mathjs';

	const presets: string[] = [
		'x^2',
		'log(x)',
		'(x^2-4)/(x-2)',
		'2^x',
		'x^3 - 2*x',
		'sin(x)',
		'sqrt(x)',
		'abs(x) - 3'
	];

	const xs = Array.from({ length: 100 }, (_, i) => -8 + i * 0.2);
	let selected = $state('x^2');
	let customFormula = $state('');

	const formula = $derived(selected === 'custom' ? customFormula : selected);
	const { data, error } = $derived(computeGraph(formula));

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

<div class="flex flex-wrap gap-x-6 gap-y-4 items-center mb-2">
	{#each presets as preset}
		<Radio name="formula" bind:group={selected} value={preset}>{preset}</Radio>
	{/each}
	<Radio name="formula" bind:group={selected} value="custom" class="flex-1">
		<div
			class="flex justify-center items-center gap-2 w-full"
			onfocusin={() => (selected = 'custom')}
		>
			<TextField
				label="Custom"
				labelPlacement="left"
				bind:value={customFormula}
				placeholder="e.g. tan(x) or x^3 - x"
				error={customFormula && error ? error : false}
				class="flex-1 min-w-[200px]"
				classes={{ label: 'text-white' }}
			/>
		</div>
	</Radio>
</div>
<div class="h-4 text-xs text-red-500 text-center mb-2">{error ?? ''}</div>

<LineChart
	{data}
	x="x"
	y="y"
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
