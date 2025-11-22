<script lang="ts">
	import { bin } from 'd3-array';
	import { BarChart, Tooltip } from 'layerchart';
	import { getOlympians } from '$lib/data.remote';
	import BarChartControls from '$lib/components/controls/BarChartControls.svelte';

	const olympians = await getOlympians();
	let thresholds = $state(10);

	const binByWeight = $derived(
		bin<(typeof olympians)[0], number>()
			.value((d) => d.weight)
			.thresholds(thresholds)
	);

	const data = $derived(binByWeight(olympians));
	export { data };
</script>

<BarChartControls bind:thresholds />

<BarChart
	{data}
	x="length"
	y="x0"
	bandPadding={0.2}
	height={16 + 24 + data.length * 20}
	props={{
		xAxis: { motion: 'tween' },
		yAxis: { motion: 'tween' },
		bars: { motion: 'tween' }
	}}
	orientation="horizontal"
>
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
</BarChart>
