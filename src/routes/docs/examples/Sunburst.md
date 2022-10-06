---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { hierarchy } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';

	import { Breadcrumb, Button, Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Arc from '$lib/components/Arc.svelte';
	import Bounds from '$lib/components/Bounds.svelte';
	import Group from '$lib/components/Group.svelte';
	import Text from '$lib/components/Text.svelte';
	import Partition from '$lib/components/Partition.svelte';
	import { findAncestor } from '$lib/utils/hierarchy';

	import Preview from '$lib/docs/Preview.svelte';

	import { complexData } from './data/hierarchy';

	const complexHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		// .sort((a, b) => b.value - a.value);
		.sort((a, b) => b.height - a.height || (b.value ?? 0) - (a.value ?? 0));

	let colorBy = 'parent';

	let selected = complexHierarchy; // select root initially

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	// filter out hard to see yellow and green
	const ordinalColor = scaleOrdinal(
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
	);
	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

	function getNodeColor(node, colorBy) {
		switch (colorBy) {
			case 'children':
				return node.children ? '#ccc' : '#ddd';
			case 'depth':
				return sequentialColor(node.depth);
			case 'parent':
				const colorParent = findAncestor(node, (n) => n.depth === 1);
				return colorParent
					? hsl(ordinalColor(colorParent.data.name)).brighter(node.depth * 0.3)
					: '#ddd';
		}
	}
</script>

<div class="grid grid-flow-col gap-4 mb-4">
	<div class="grid grid-cols-[1fr,1fr] gap-2">
		<Field label="Color By">
			<ToggleGroup bind:value={colorBy} contained class="w-full">
				<div class="options w-full border h-8">
					<ToggleOption value="parent">Parent</ToggleOption>
					<ToggleOption value="depth">Depth</ToggleOption>
				</div>
			</ToggleGroup>
		</Field>
	</div>
</div>

## Suburst

<Preview>
	<Breadcrumb items={selected?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => (selected = item)} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[600px] p-4 border rounded">
		<Chart data={complexHierarchy}>
			<Svg>
				<Bounds
					domain={{ x0: selected?.x0 ?? 0, x1: selected?.x1 ?? 1, y0: selected?.y0 ?? 0, y1: 1 }}
					range={({ height }) => ({
						x0: 0,
						x1: 2 * Math.PI,
						y0: selected?.y0 ? 20 : 0,
						y1: height / 2
					})}
					tweened={{ duration: 800, easing: cubicOut }}
					let:xScale
					let:yScale
				>
					<Partition size={[1, 1]} let:nodes>
						<Group center>
							{#each nodes as node}
								{@const nodeColor = getNodeColor(node, colorBy)}
								<Arc
									value={node.value}
									startAngle={Math.max(0, Math.min(2 * Math.PI, xScale(node.x0)))}
									endAngle={Math.max(0, Math.min(2 * Math.PI, xScale(node.x1)))}
									innerRadius={Math.max(0, yScale(node.y0))}
									outerRadius={Math.max(0, yScale(node.y1))}
									fill={nodeColor}
									_stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 2)}
									stroke="hsl(0 0% 20%)"
									class="cursor-pointer"
									let:centroid
									on:click={() => {
										selected = node;
									}}
								>
									<!-- <text x={centroid[0]} y={centroid[1]}>{node.data.name}</text> -->
								</Arc>
							{/each}
						</Group>
					</Partition>
				</Bounds>
			</Svg>
		</Chart>
	</div>
</Preview>
