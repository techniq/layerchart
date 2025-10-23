<script lang="ts">
	import { BarChart, Labels } from 'layerchart';
	import { wideData } from '$lib/utils/data.js';

	const data = wideData;

	export { data };
</script>

<BarChart
	{data}
	x="year"
	series={[
		{ key: 'apples', color: 'var(--color-danger)' },
		{
			key: 'bananas',
			color: 'var(--color-warning)'
		},
		{
			key: 'cherries',
			color: 'var(--color-success)'
		},
		{
			key: 'grapes',
			color: 'var(--color-info)'
		}
	]}
	seriesLayout="group"
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'metric' },
		tooltip: {
			header: { format: 'none' }
		}
	}}
	height={300}
>
	{#snippet aboveMarks({ context, visibleSeries })}
		{#each visibleSeries as s}
			<Labels
				data={context.data.filter(
					(d) => context.yScale(d[s.key] || 0) > context.yScale.range()[0] - 16
				)}
				x={context.xScale}
				y={(d) => context.yScale(d[s.key] || 0)}
				value={(d) => d[s.key]}
				verticalAnchor="end"
				class="text-xs fill-surface-content/75 pointer-events-none"
				format="metric"
			/>
		{/each}
	{/snippet}
</BarChart>
