<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import { LineChart } from 'layerchart';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { getSeriesArrays } from '$lib/data.remote.js';
	import Blockquote from '$lib/markdown/components/blockquote.svelte';

	const data = await getSeriesArrays();

	let example = $state<'single'>('single');
	let motion = $state(true);
	let show = $state(true);

	let chartProps = $derived<ComponentProps<typeof LineChart>['props']>({
		xAxis: { format: (v) => format(new Date(v)) },
		tooltip: {
			root: { motion: motion ? 'spring' : 'none' },
			header: { format: (v) => format(new Date(v)) }
		},
		highlight: { motion: motion ? 'spring' : 'none' }
	});
</script>

<div class="grid gap-4">
	<div class="flex gap-3">
		<Field label="Motion">
			<ToggleGroup bind:value={motion} variant="outline">
				<ToggleOption value={true}>Yes</ToggleOption>
				<ToggleOption value={false}>No</ToggleOption>
			</ToggleGroup>
		</Field>

		<Field label="Show">
			<ToggleGroup bind:value={show} variant="outline">
				<ToggleOption value={true}>Yes</ToggleOption>
				<ToggleOption value={false}>No</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>

	<ToggleGroup bind:value={example} variant="underline" classes={{ options: 'justify-start h-10' }}>
		<ToggleOption value="single">Single</ToggleOption>
		<ToggleOption value="series">Series</ToggleOption>
	</ToggleGroup>

	<div>
		{#key chartProps}
			{#if example === 'single'}
				<div class="h-[500px] p-4 border rounded-sm">
					{#if show}
						<LineChart data={data.cpu} x="x" y="y" props={chartProps} brush profile />
					{/if}
				</div>
			{:else if example === 'series'}
				<div class="h-[500px] p-4 border rounded-sm">
					{#if show}
						<LineChart
							x="x"
							y="y"
							series={[
								{ key: 'cpu', data: data.cpu, color: 'var(--color-danger)' },
								{ key: 'ram', data: data.ram, color: 'var(--color-warning)' },
								{ key: 'tcp', data: data.tcp, color: 'var(--color-success)' }
							]}
							props={chartProps}
							brush
							profile
						/>
					{/if}
				</div>
			{/if}
		{/key}
	</div>

	<Blockquote>
		Array per series, each with `x` / `y` items. {format(data.cpu.length)} data points
	</Blockquote>
</div>
