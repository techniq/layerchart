<script lang="ts">
	import { accessor, BarChart, Text } from 'layerchart';
	import { wideData } from '$lib/utils/data.js';

	const data = wideData;

	export { data };
</script>

<BarChart
	data={wideData}
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
	<!-- Workaround until x1Scale is directly handled by Points/Labels: https://github.com/techniq/layerchart/issues/473#issuecomment-3266370636 -->
	{#snippet aboveMarks({ context, visibleSeries })}
		{#each visibleSeries as s}
			{#each wideData as d}
				{@const valueAccessor = accessor(s.key)}
				{@const value = valueAccessor(d)}
				<Text
					x={context.xScale(d.year) +
						(context.x1Scale?.(s.key) ?? 0) +
						(context.x1Scale?.bandwidth?.() ?? 0) / 2}
					y={context.yScale(value)}
					{value}
					textAnchor="middle"
					class="text-xs"
				/>
			{/each}
		{/each}
	{/snippet}
</BarChart>
