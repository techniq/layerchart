<script lang="ts">
	import { Chart, defaultChartPadding, Rect, Tooltip } from 'layerchart';
	import { bin } from 'd3-array';
	import { randomNormal } from 'd3-random';
	import HistogramControls from '$lib/components/controls/HistogramControls.svelte';

	let selectedGenerator = $state('normal');
	let randomCount = $state(1000);
	let random = $state(randomNormal());
	const randomData = $derived(Array.from({ length: randomCount }, () => random()));
	const binByValues = $derived(bin()); //.domain([0, 1]);
	const randomBins = $derived(binByValues(randomData));
	export { randomBins as data };
</script>

<HistogramControls bind:random bind:selectedGenerator bind:randomCount />

<Chart
	data={randomBins}
	x={['x0', 'x1']}
	y="length"
	props={{
		yAxis: { format: 'metric' }
	}}
	motion={{ type: 'spring' }}
	padding={defaultChartPadding({ left: 30 })}
	height={300}
	tooltipContext={{ mode: 'band' }}
	highlight={{ area: true }}
>
	{#snippet marks()}
		<Rect x0="x0" y0={(d) => 0} x1="x1" y1="length" insets={{ x: 1 }} class="fill-primary" />
	{/snippet}
	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header class="text-center">{data.x0 + ' - ' + (data.x1 - 0.01)}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="count" value={data.length} format="integer" />
					<Tooltip.Separator />
					{#each data.slice(0, 5) as d}
						<Tooltip.Item label="value" value={d} />
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
