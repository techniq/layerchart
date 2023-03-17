---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { rollup } from 'd3-array'

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import { Breadcrumb, Button, Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { format } from 'svelte-ux/utils/format';

	import Preview from '$lib/docs/Preview.svelte';
	import RangeField from '$lib/docs/RangeField.svelte';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Bounds from '$lib/components/Bounds.svelte';
	import ChartClipPath from '$lib/components/ChartClipPath.svelte';
	import Group from '$lib/components/Group.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import RectClipPath from '$lib/components/RectClipPath.svelte';
	import Text from '$lib/components/Text.svelte';
	import Partition from '$lib/components/Partition.svelte';
	import { findAncestor } from '$lib/utils/hierarchy';

	import { complexData } from '../_data/hierarchy';
	import carsCsv from '../_data/cars.csv'

	const complexHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	const horizontalHierarchy = complexHierarchy.copy()
	const verticalHierarchy = complexHierarchy.copy()

	let isFiltered = false;
	$: groupedCars = rollup(
		carsCsv
			// Limit dataset
			.filter(d => ['BMW', 'Chevrolet', 'Dodge', 'Ford', 'Honda', 'Toyota', 'Volkswagen'].includes(d.Make))
			// Hide some models in each group to show transitions
			.filter(d => isFiltered ? d.Year > 2010 : true)
			// Apply `Make` selection
			.filter(d => {
				if (selectedCarNode?.depth === 1) {
					return d.Make === selectedCarNode.data[0]
				} else {
					return true
				}
			}),
		items => items[0],//.slice(0, 3),
		d => d.Make,
		d => d.Model,
		// d => d.Year,
	)
	$: groupedHierarchy = hierarchy(groupedCars).count()

	let colorBy = 'children';

	let padding = 0;
	let round = false;
	let fullSizeLeafNodes = false;
	let selectedHorizontal = horizontalHierarchy; // select root initially
	let selectedVertical = verticalHierarchy; // select root initially
	let selectedCarNode = groupedHierarchy;

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
	<div class="grid grid-cols-[2fr,1fr,1fr,1fr] gap-2">
		<RangeField label="Padding" bind:value={padding} max={20} />
		<Field label="Full-size Leaf Nodes">
			<ToggleGroup bind:value={fullSizeLeafNodes} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={true}>Yes</ToggleOption>
				<ToggleOption value={false}>No</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Round">
			<ToggleGroup bind:value={round} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={true}>Yes</ToggleOption>
				<ToggleOption value={false}>No</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Color By">
			<ToggleGroup bind:value={colorBy} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="children">Children</ToggleOption>
				<ToggleOption value="depth">Depth</ToggleOption>
				<ToggleOption value="parent">Parent</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>
</div>

## Horizontal

<Preview>
	<Breadcrumb items={selectedHorizontal?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selectedHorizontal = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{format(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[600px] p-4 border rounded">
		<Chart data={horizontalHierarchy} let:width>
			<Svg>
				<Bounds
					let:xScale
					let:yScale
					domain={{ x0: selectedHorizontal?.y0, y0: selectedHorizontal?.x0, y1: selectedHorizontal?.x1 }}
					tweened={{ duration: 800, easing: cubicOut }}
				>
					<ChartClipPath>
						<Partition {padding} {round} let:nodes>
							{#each nodes as node}
								{@const nodeWidth = node.children || !fullSizeLeafNodes ? xScale(node.y1) - xScale(node.y0) : width - xScale(node.y0)}
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
												<text x={4} y={16 * 0.6 + 4} style="font-size: 0.6rem; font-weight: 500">
													<tspan>{node.data.name}</tspan>
													<tspan style="font-size: 0.5rem; font-weight: 200">{format(node.value, 'integer')}</tspan>
												</text>
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
				<div class="text-xs text-black/50">{format(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[600px] p-4 border rounded">
		<Chart data={verticalHierarchy} let:height>
			<Svg>
				<Bounds
					let:xScale
					let:yScale
					domain={{ x0: selectedVertical?.x0, y0: selectedVertical?.y0, x1: selectedVertical?.x1 }}
					tweened={{ duration: 800, easing: cubicOut }}
				>
					<ChartClipPath>
						<Partition orientation="vertical" {padding} {round} let:nodes>
							{#each nodes as node}
								{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
								{@const nodeHeight = node.children || !fullSizeLeafNodes ? yScale(node.y1) - yScale(node.y0) : height - yScale(node.y0)}
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
													value={node.data.name}
													style="font-size: 0.6rem; font-weight: 500"
													verticalAnchor="start"
													x={4}
													y={2}
												/>
												<Text
													value={format(node.value, 'integer')}
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

## Filterable

<div class="grid gap-1 mb-4">
	<div class="grid grid-cols-4 gap-2">
		<Field label="Apply Partial Filter" let:id>
			<Switch {id} bind:checked={isFiltered} />
		</Field>
	</div>
</div>

<Preview>
	<Breadcrumb items={selectedCarNode?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selectedCarNode = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data[0] ?? 'Overall'}</div>
				<div class="text-xs text-black/50">{format(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[600px] p-4 border rounded">
		<Chart data={groupedHierarchy}>
			<Svg>
				<Bounds
					let:xScale
					let:yScale
					domain={{ x0: selectedCarNode?.y0, y0: selectedCarNode?.x0, y1: selectedCarNode?.x1 }}
				>
					<ChartClipPath>
						<Partition {padding} {round} let:nodes>
							{#each nodes as node (node.ancestors().map(n => n.data[0]).join('_'))}
								<Group x={xScale(node.y0)} y={yScale(node.x0)} on:click={() => selectedCarNode = node} tweened={{ delay: 600 }}>
									{@const nodeWidth = xScale(node.y1) - xScale(node.y0)}
									{@const nodeHeight = yScale(node.x1) - yScale(node.x0)}
									{@const nodeColor = getNodeColor(node, colorBy)}
									<g in:fade={{ duration: 600, delay: 1200 }} out:fade={{ duration: 600 }}>
										<Rect
											width={nodeWidth}
											height={nodeHeight}
											stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
											fill={nodeColor}
											rx={5}
											tweened={{ delay: 600 }}
										/>
										<RectClipPath width={nodeWidth} height={nodeHeight} tweened={{ delay: 600 }}>
											<text x={4} y={16 * 0.6 + 4} style="font-size: 0.6rem; font-weight: 500">
												<tspan>{node.data[0] ?? 'Overall'}</tspan>
												{#if node.children}
													<tspan style="font-size: 0.5rem; font-weight: 200">{format(node.value, 'integer')}</tspan>
												{/if}
											</text>
										</RectClipPath>
									</g>
								</Group>
							{/each}
						</Partition>
					</ChartClipPath>
				</Bounds>
			</Svg>
		</Chart>
	</div>
</Preview>
