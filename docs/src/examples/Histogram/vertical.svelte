<script lang="ts">
	import { bin } from 'd3-array';
	import { BarChart, Tooltip } from 'layerchart';
	import { getOlympians } from '$lib/data.remote';

	const olympians = await getOlympians();
	const binByWeight = bin()
		.value((d) => d.weight)
		.thresholds(10);
	const data = binByWeight(olympians);

	export { data };
</script>

<BarChart
	{data}
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
