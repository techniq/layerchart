<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { cubicOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { groupStackData, transformGroupStackData } from '$lib/utils/data.js';
	import { Button } from 'svelte-ux';

	const keyColors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];

	let mode = $state('grouped'); // 'grouped', 'stacked', or 'both'

	const rawData = [
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
	];

	const groupedData = transformGroupStackData(groupStackData(rawData), 'grouped');
	const stackedData = groupStackData(rawData);
	const bothData = transformGroupStackData(stackedData, 'both');

	let data = tweened(groupedData, { duration: 1000, easing: cubicOut });

	$effect(() => {
		if (mode === 'grouped') {
			data.set(groupedData);
		} else if (mode === 'stacked') {
			data.set(stackedData);
		} else {
			data.set(bothData);
		}
	});

	export { $data };
</script>

<div class="flex items-center gap-2 mb-4">
	<Button
		on:click={() => (mode = 'grouped')}
		variant={mode === 'grouped' ? 'fill' : 'outline'}
		size="sm"
	>
		Grouped
	</Button>
	<Button
		on:click={() => (mode = 'stacked')}
		variant={mode === 'stacked' ? 'fill' : 'outline'}
		size="sm"
	>
		Stacked
	</Button>
	<Button on:click={() => (mode = 'both')} variant={mode === 'both' ? 'fill' : 'outline'} size="sm">
		Both
	</Button>
</div>

<Chart
	data={$data}
	x="category"
	xScale={scaleBand().padding(0.4)}
	y={mode === 'grouped' ? 'value' : ['start', 'end']}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'bisect-x' }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" />
	{#each $data.keys as key, keyIndex}
		<Bars
			y={mode === 'grouped' ? (d) => d.values[key] : (d) => d.values[key]}
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
