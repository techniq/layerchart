<script lang="ts">
	import { BarChart, Labels, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };
</script>

<BarChart
	{data}
	x="value"
	y="date"
	labels
	orientation="horizontal"
	axis={false}
	padding={defaultChartPadding({ left: 4, right: 10 })}
	height={500}
>
	{#snippet aboveMarks()}
		<Labels x={(d) => 0} value="date" class="text-sm fill-surface-300 stroke-none" />
	{/snippet}
</BarChart>
