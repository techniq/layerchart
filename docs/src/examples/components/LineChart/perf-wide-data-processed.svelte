<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import { LineChart } from 'layerchart';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { getWideData } from '$lib/data.remote.js';
	import Blockquote from '$lib/markdown/components/blockquote.svelte';

	const data = await getWideData();

	let example = $state<'single'>('single');
	let motion = $state(true);
	let show = $state(true);

	let chartProps = $derived<ComponentProps<typeof LineChart>['props']>({
		tooltip: { root: { motion: motion ? 'spring' : 'none' } },
		highlight: { motion: motion ? 'spring' : 'none' }
	});

	let chartData = $derived(
		data.map((d) => {
			return {
				date: new Date(d.epoch * 60 * 1000),
				cpu: 100 - d.idl,
				ram: (100 * d.writ) / (d.writ + d.used),
				tcp: d.send
			};
		})
	);
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
						<LineChart data={chartData} x="date" y="cpu" props={chartProps} brush profile />
					{/if}
				</div>
			{:else if example === 'series'}
				<div class="h-[500px] p-4 border rounded-sm">
					{#if show}
						<LineChart
							data={chartData}
							x="date"
							series={[
								{ key: 'cpu', color: 'var(--color-danger)' },
								{
									key: 'ram',
									color: 'var(--color-warning)'
								},
								{ key: 'tcp', color: 'var(--color-success)' }
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
		Wide data (property per series). Pre-processed before passed to LineChart. {format(
			chartData.length
		)} data points
	</Blockquote>
</div>
