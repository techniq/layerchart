<script lang="ts">
	import { scaleBand, scaleTime } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { groupStackData } from '$lib/utils/data.js';
	import { createDateSeries } from '$lib/utils/data.js';

	const keyColors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];

	const rawData = createDateSeries({
		count: 30,
		min: 10,
		max: 50,
		value: 'integer',
		keys: ['x', 'y', 'z']
	});

	const data = groupStackData(rawData, { keys: ['x', 'y', 'z'] });

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleTime()}
	y={['start', 'end']}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'bisect-x' }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" format="week" />
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
			<Tooltip.Header value={tooltipData.date} format="day" />
			<Tooltip.List>
				{#each data.keys as key}
					<Tooltip.Item label={key} value={tooltipData.values[key]} />
				{/each}
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
