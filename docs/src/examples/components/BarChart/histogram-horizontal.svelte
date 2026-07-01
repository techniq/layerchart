<script module lang="ts">
	import { getOlympians } from '$lib/data.remote';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Chart, defaultChartPadding, Rect, Tooltip } from 'layerchart';
	import { bin } from 'd3-array';
	import HistogramControls from '$lib/components/controls/HistogramControls.svelte';

	let thresholds = $state(10);

	const binByWeight = $derived(
		bin<(typeof olympians)[0], number>()
			.value((d) => d.weight)
			.thresholds(thresholds)
	);

	const data = $derived(binByWeight(olympians));
	export { data };
</script>

<HistogramControls bind:thresholds />

<Chart
	{data}
	x="length"
	y={['x0', 'x1']}
	valueAxis="x"
	height={400}
	padding={defaultChartPadding({ right: 20 })}
	motion={{ type: 'spring' }}
	tooltipContext={{ mode: 'band' }}
	highlight={{ area: true }}
	clip
>
	{#snippet marks()}
		<Rect x0={(d) => 0} y0="x0" x1="length" y1="x1" insets={{ y: 1 }} class="fill-primary" />
	{/snippet}
	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header class="text-center">{data.x0 + ' - ' + (data.x1 - 1)}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="count" value={data.length} format="integer" />
					<Tooltip.Separator />
					{#each data.slice(0, 5) as d}
						<Tooltip.Item label={d.name} value={d.weight} />
					{/each}
					{#if data.length > 5}
						<span></span>
						<span>...</span>
					{/if}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
