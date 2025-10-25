<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { groupStackData } from '$lib/utils/data.js';

	const keyColors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];

	let clickedData = $state(null);

	const data = groupStackData([
		{ category: 'A', value: 25, group: 'x' },
		{ category: 'A', value: 18, group: 'y' },
		{ category: 'A', value: 12, group: 'z' },
		{ category: 'B', value: 12, group: 'x' },
		{ category: 'B', value: 29, group: 'y' },
		{ category: 'B', value: 15, group: 'z' },
		{ category: 'C', value: 8, group: 'x' },
		{ category: 'C', value: 30, group: 'y' },
		{ category: 'C', value: 18, group: 'z' },
		{ category: 'D', value: 15, group: 'x' },
		{ category: 'D', value: 20, group: 'y' },
		{ category: 'D', value: 22, group: 'z' }
	]);

	function handleBarClick(event) {
		const { data: barData, group } = event.detail;
		clickedData = { ...barData, group };
		console.log('Clicked bar:', barData, 'Group:', group);
	}

	export { data };
</script>

{#if clickedData}
	<div class="mb-4 p-2 bg-surface-100 rounded text-sm">
		Clicked: {clickedData.category} - {clickedData.group} ({clickedData.values[clickedData.group]})
	</div>
{/if}

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
			on:click={handleBarClick}
			class="cursor-pointer hover:opacity-80"
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
