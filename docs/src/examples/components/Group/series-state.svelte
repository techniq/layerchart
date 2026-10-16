<script lang="ts">
	import { Circle, defaultChartPadding, Group, LineChart, Text } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 20,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});
	export { data };

	const series = [
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'oranges', color: 'var(--color-oranges)' }
	];

	const lastPoint = data[data.length - 1];
</script>

<LineChart
	{data}
	x="date"
	{series}
	legend
	padding={defaultChartPadding({ legend: true, right: 70 })}
	height={300}
>
	{#snippet aboveMarks()}
		{#each series as s (s.key)}
			<Group seriesKey={s.key} data={[lastPoint]} x="date" y={s.key}>
				<Circle r={4} fill={s.color} />
				<Text value={s.key} dx={8} dy={4} class="text-xs fill-surface-content" />
			</Group>
		{/each}
	{/snippet}
</LineChart>
