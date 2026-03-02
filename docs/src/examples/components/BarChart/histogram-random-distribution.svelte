<script lang="ts">
	import { LineChart, defaultChartPadding, Rect, Tooltip } from 'layerchart';
	import { bin } from 'd3-array';
	import { randomNormal } from 'd3-random';
	import BarChartControls2 from '$lib/components/controls/BarChartControls2.svelte';

	let selectedGenerator = $state('normal');
	let randomCount = $state(1000);
	let random = $state(randomNormal());
	const randomData = $derived(Array.from({ length: randomCount }, () => random()));
	const binByValues = $derived(bin()); //.domain([0, 1]);
	const randomBins = $derived(binByValues(randomData));
	export { randomBins as data };
</script>

<BarChartControls2 bind:random bind:selectedGenerator bind:randomCount />

<LineChart
	data={randomBins}
	x={['x0', 'x1']}
	y="length"
	props={{
		yAxis: { format: 'metric' }
	}}
	motion={{ type: 'spring' }}
	padding={defaultChartPadding({ left: 30 })}
	height={300}
>
	{#snippet marks({ context })}
		{#each randomBins as d}
			<Rect
				x={context.xScale(d.x0) + 1}
				y={context.yScale(d.length)}
				width={context.xScale(d.x1) - context.xScale(d.x0) - 2}
				height={context.yScale(0) - context.yScale(d.length)}
				class="fill-primary"
				motion="tween"
			/>
		{/each}
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
</LineChart>
