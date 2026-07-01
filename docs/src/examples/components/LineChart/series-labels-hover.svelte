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
	{#snippet aboveMarks({ context })}
		{#if context.series.highlightKey}
			<Labels seriesKey={context.series.highlightKey} offset={10} />
		{/if}
	{/snippet}
</LineChart>
