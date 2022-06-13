---
title: ['Charts', 'Partition']
---

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { hierarchy } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import { Breadcrumb, Button, Field, Tabs, Tab } from 'svelte-ux';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Bounds from '$lib/components/Bounds.svelte';
	import ChartClipPath from '$lib/components/ChartClipPath.svelte';
	import Group from '$lib/components/Group.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import RectClipPath from '$lib/components/RectClipPath.svelte';
	import Text from '$lib/components/Text.svelte';
	import Partition from '$lib/components/Partition.svelte';
	import { findAncestor } from '$lib/utils/hierarchy';

	import Preview from '$lib/docs/Preview.svelte';

	import { complexData } from './data/hierarchy';

	const complexHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	const horizontalHierarchy = complexHierarchy.copy()
	const verticalHierarchy = complexHierarchy.copy()

	let colorBy = 'children';

	let padding = 0;
	let round = false;
	let selectedHorizontal = horizontalHierarchy; // select root initially
	let selectedVertical = verticalHierarchy; // select root initially

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu)
	// filter out hard to see yellow and green
	const ordinalColor = scaleOrdinal(chromatic.schemeSpectral[9].filter(c => hsl(c).h < 60 || hsl(c).h > 90))
	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

	function getNodeColor(node, colorBy) {
		switch (colorBy) {
			case 'children':
				return node.children ? '#ccc' : '#ddd'
			case 'depth':
				return sequentialColor(node.depth);
			case 'parent':
				const colorParent = findAncestor(node, n => n.depth === 1)
				return colorParent ? hsl(ordinalColor((colorParent).data.name)).brighter(node.depth * .3) : '#ddd'
		}
	}
</script>

<div class="grid grid-flow-col gap-4 mb-4">
	<div class="grid grid-cols-[2fr,1fr,1fr] gap-2">
		<Field label="Padding" let:id>
			<Button icon={mdiChevronLeft} on:click={() => padding -= 1} class="mr-2" />
			<input type="range" bind:value={padding} min={0} max={20} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{padding}</span>
			<Button icon={mdiChevronRight} on:click={() => padding += 1} class="ml-2" />
		</Field>
		<Field label="Round">
			<Tabs bind:selected={round} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value={true}>Yes</Tab>
					<Tab value={false}>No</Tab>
				</div>
			</Tabs>
		</Field>
		<Field label="Color By">
			<Tabs bind:selected={colorBy} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value="children">Children</Tab>
					<Tab value="depth">Depth</Tab>
					<Tab value="parent">Parent</Tab>
				</div>
			</Tabs>
		</Field>
	</div>
</div>

## Horizontal

<Preview>
	<Breadcrumb items={selectedHorizontal?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selectedHorizontal = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[600px] p-4 border rounded">
		<Chart data={horizontalHierarchy}>
			<Svg>
				<Bounds
					let:xScale
					let:yScale
					domain={{ x0: selectedHorizontal?.y0, y0: selectedHorizontal?.x0, y1: selectedHorizontal?.x1 }}
				>
					<ChartClipPath>
						<Partition {padding} {round} let:nodes>
							{#each nodes as node}
								{@const nodeWidth = xScale(node.y1) - xScale(node.y0)}
								{@const nodeHeight = yScale(node.x1) - yScale(node.x0)}
								<Group x={xScale(node.y0)} y={yScale(node.x0)} on:click={() => selectedHorizontal = node}>
									<RectClipPath width={nodeWidth} height={nodeHeight}>
										{@const nodeColor = getNodeColor(node, colorBy)}
										<g transition:fade={{ duration: 600 }}>
											<Rect
												width={nodeWidth}
												height={nodeHeight}
												stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
												fill={nodeColor}
												rx={5}
											/>
												<Text
													value="{node.data.name} ({node.children?.length ?? 0})"
													style="font-size: 0.6rem; font-weight: 500"
													verticalAnchor="start"
													x={4}
													y={2}
												/>
												<Text
													value={formatNumberAsStyle(node.value, 'integer')}
													style="font-size: 0.5rem; font-weight: 200"
													verticalAnchor="start"
													x={4}
													y={16}
												/>
										</g>
									</RectClipPath>
								</Group>
							{/each}
						</Partition>
					</ChartClipPath>
				</Bounds>
			</Svg>
		</Chart>
	</div>
</Preview>

## Vertical

<Preview>
	<Breadcrumb items={selectedVertical?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selectedVertical = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[600px] p-4 border rounded">
		<Chart data={verticalHierarchy}>
			<Svg>
				<Bounds
					let:xScale
					let:yScale
					domain={{ x0: selectedVertical?.x0, y0: selectedVertical?.y0, x1: selectedVertical?.x1 }}
				>
					<ChartClipPath>
						<Partition orientation="vertical" {padding} {round} let:nodes>
							{#each nodes as node}
								{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
								{@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
								<Group x={xScale(node.x0)} y={yScale(node.y0)} on:click={() => selectedVertical = node}>
									<RectClipPath width={nodeWidth} height={nodeHeight}>
										{@const nodeColor = getNodeColor(node, colorBy)}
										<g transition:fade={{ duration: 600 }}>
											<Rect
												width={nodeWidth}
												height={nodeHeight}
												stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
												fill={nodeColor}
												rx={5}
											/>
												<Text
													value="{node.data.name} ({node.children?.length ?? 0})"
													style="font-size: 0.6rem; font-weight: 500"
													verticalAnchor="start"
													x={4}
													y={2}
												/>
												<Text
													value={formatNumberAsStyle(node.value, 'integer')}
													style="font-size: 0.5rem; font-weight: 200"
													verticalAnchor="start"
													x={4}
													y={16}
												/>
										</g>
									</RectClipPath>
								</Group>
							{/each}
						</Partition>
					</ChartClipPath>
				</Bounds>
			</Svg>
		</Chart>
	</div>
</Preview>
