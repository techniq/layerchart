<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { cubicOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { groupStackData } from '$lib/utils/data.js';
	import { Button } from 'svelte-ux';

	const keyColors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];

	const datasets = [
		[
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
		],
		[
			{ category: 'A', value: 20, group: 'x' },
			{ category: 'A', value: 25, group: 'y' },
			{ category: 'A', value: 8, group: 'z' },
			{ category: 'B', value: 18, group: 'x' },
			{ category: 'B', value: 22, group: 'y' },
			{ category: 'B', value: 20, group: 'z' },
			{ category: 'C', value: 12, group: 'x' },
			{ category: 'C', value: 28, group: 'y' },
			{ category: 'C', value: 15, group: 'z' },
			{ category: 'D', value: 10, group: 'x' },
			{ category: 'D', value: 25, group: 'y' },
			{ category: 'D', value: 18, group: 'z' }
		]
	];

	let currentDataset = 0;
	let data = tweened(groupStackData(datasets[0]), { duration: 1000, easing: cubicOut });

	function toggleData() {
		currentDataset = (currentDataset + 1) % datasets.length;
		data.set(groupStackData(datasets[currentDataset]));
	}

	export { datasets as data };
</script>

<div class="flex items-center gap-2 mb-4">
	<Button on:click={toggleData} variant="outline" size="sm">Toggle Data</Button>
</div>

<Chart
	data={$data}
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
	{#each $data.keys as key, keyIndex}
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
				{#each $data.keys as key}
					<Tooltip.Item label={key} value={tooltipData.values[key]} />
				{/each}
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
