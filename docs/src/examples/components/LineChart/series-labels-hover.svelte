<script lang="ts">
	import { Labels, LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});
	export { data };
</script>

<LineChart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{
			key: 'bananas',
			color: 'var(--color-bananas)'
		},
		{
			key: 'oranges',
			color: 'var(--color-oranges)'
		}
	]}
	padding={20}
	height={300}
>
	{#snippet aboveMarks({ context, getLabelsProps })}
		{#if context.series.highlightKey}
			{@const activeSeriesIndex = context.series.series.findIndex(
				(s) => s.key === context.series.highlightKey
			)}
			<Labels
				{...getLabelsProps(context.series.series[activeSeriesIndex], activeSeriesIndex)}
				offset={10}
			/>
		{/if}
	{/snippet}
</LineChart>
