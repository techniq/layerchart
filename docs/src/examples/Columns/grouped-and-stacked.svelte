<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { groupStackData } from '$lib/utils/data.js';

	const keyColors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];

	// Create grouped and stacked data structure
	const rawData = [
		// Group 1
		{ category: 'Q1', value: 25, group: 'x', series: 'A' },
		{ category: 'Q1', value: 18, group: 'y', series: 'A' },
		{ category: 'Q1', value: 20, group: 'x', series: 'B' },
		{ category: 'Q1', value: 15, group: 'y', series: 'B' },

		// Group 2
		{ category: 'Q2', value: 30, group: 'x', series: 'A' },
		{ category: 'Q2', value: 22, group: 'y', series: 'A' },
		{ category: 'Q2', value: 18, group: 'x', series: 'B' },
		{ category: 'Q2', value: 25, group: 'y', series: 'B' },

		// Group 3
		{ category: 'Q3', value: 28, group: 'x', series: 'A' },
		{ category: 'Q3', value: 20, group: 'y', series: 'A' },
		{ category: 'Q3', value: 22, group: 'x', series: 'B' },
		{ category: 'Q3', value: 19, group: 'y', series: 'B' }
	];

	const data = groupStackData(rawData, { groupBy: 'series', stackBy: 'group' });

	export { data };
</script>

<Chart
	{data}
	x="category"
	xScale={scaleBand().padding(0.4)}
	y={['start', 'end']}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'bisect-x' }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" />
	{#each data.keys as key, keyIndex}
		<Bars
			y={(d) => d.values[key]}
			fill={keyColors[keyIndex]}
			rounded="top"
			strokeWidth={1}
			data={{ group: key }}
		/>
	{/each}
	<Highlight area />
	<Tooltip.Root>
		{#snippet children({ data: tooltipData })}
			<Tooltip.Header value={tooltipData.category} />
			<Tooltip.List>
				{#each data.keys as key}
					<Tooltip.Item label={key} value={tooltipData.values[key]} />
				{/each}
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
