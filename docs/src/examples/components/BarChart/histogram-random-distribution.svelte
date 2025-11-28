<script lang="ts">
	import { bin } from 'd3-array';
	import { randomNormal } from 'd3-random';
	import { BarChart, Tooltip } from 'layerchart';
	import BarChartControls2 from '$lib/components/controls/BarChartControls2.svelte';

	let selectedGenerator = $state('normal');
	let randomCount = $state(1000);
	let random = $state(randomNormal());
	const randomData = $derived(Array.from({ length: randomCount }, () => random()));
	const binByValues = $derived(bin()); //.domain([0, 1]);
	const randomBins = $derived(binByValues(randomData));

	export { data };
</script>

<BarChartControls2 bind:random bind:selectedGenerator bind:randomCount />

<BarChart
	data={randomBins}
	x="x0"
	y="length"
	bandPadding={0.2}
	props={{
		xAxis: { motion: 'tween' },
		yAxis: { format: 'metric', motion: 'tween' },
		bars: { motion: 'tween' }
	}}
	height={300}
>
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
</BarChart>
