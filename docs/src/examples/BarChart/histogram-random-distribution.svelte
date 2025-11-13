<script lang="ts">
	import { bin } from 'd3-array';
	import { randomNormal } from 'd3-random';
	import { BarChart, Tooltip } from 'layerchart';

	const random = randomNormal();
	const randomData = Array.from({ length: 1000 }, () => random());
	const binByValues = bin();
	const data = binByValues(randomData);

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
