---
title: ['Charts', 'Sankey']
---

<script lang="ts">
	import { hierarchy } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { fade } from 'svelte/transition';

	import { Button, Breadcrumb, Field, Tabs, Tab } from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Group from '$lib/components/Group.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import RectClipPath from '$lib/components/RectClipPath.svelte';
	import Text from '$lib/components/Text.svelte';
	import Treemap from '$lib/components/Treemap.svelte';
	import { findAncestor } from '$lib/utils/hierarchy';

	import Preview from '$lib/docs/Preview.svelte';

	import { simpleData, complexData } from './data/hierarchy';

	const complexDataHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	let tile = 'squarify'
	let colorBy = 'children';

	let selectedNested = null;
	let selectedZoomable = null;

	/**
	 * Show if the node (a) is a child of the selected (b), or any parent of the selected
	 */
	function isVisible(a, b) {
		while (b) {
			if (a.parent === b) return true;
			b = b.parent;
		}

		return false;
	}

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

## Nested

<div class="grid grid-flow-col gap-4 mb-4">
	<div class="grid grid-cols-[6fr,3fr] gap-2">
		<Field label="Tile">
			<Tabs bind:selected={tile} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value="squarify">Squarify</Tab>
					<Tab value="resquarify">Resquarify</Tab>
					<Tab value="binary">Binary</Tab>
					<Tab value="slice">Slice</Tab>
					<Tab value="dice">Dice</Tab>
					<Tab value="sliceDice">Slice / Dice</Tab>
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

<Preview>
	<Breadcrumb items={selectedNested?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selectedNested = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[800px] p-4 border rounded">
		<Chart data={complexDataHierarchy.copy()}>
			<Svg>
				<Treemap {tile} bind:selected={selectedNested} paddingOuter={3} paddingTop={19} paddingInner={2} >
					<Group slot="node" let:node let:rect x={rect.x} y={rect.y} on:click={() => node.children ? selectedNested = node : null}>
						{@const nodeColor = getNodeColor(node, colorBy)}
						<g transition:fade={{ duration: 600 }}>
							<Rect
								width={rect.width}
								height={rect.height}
								stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
								fill={nodeColor}
								rx={5}
							/>
							<RectClipPath width={rect.width} height={rect.height}>
								<text x={4} y={16 * 0.6 + 4} style="font-size: 0.6rem; font-weight: 500">
									<tspan>{node.data.name}</tspan>
									{#if node.children}
										<tspan style="font-size: 0.5rem; font-weight: 200">{formatNumberAsStyle(node.value, 'integer')}</tspan>
									{/if}
								</text>
								{#if !node.children}
									<Text
										value={formatNumberAsStyle(node.value, 'integer')}
										style="font-size: 0.5rem; font-weight: 200"
										verticalAnchor="start"
										x={4}
										y={16}
									/>
								{/if}
							</RectClipPath>
						</g>
					</Group>
				</Treemap>
			</Svg>
		</Chart>
	</div>
</Preview>

## Zoomable

<div class="grid grid-flow-col gap-4 mb-4">
	<div class="grid grid-cols-[6fr,3fr] gap-2">
		<Field label="Tile">
			<Tabs bind:selected={tile} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value="squarify">Squarify</Tab>
					<Tab value="resquarify">Resquarify</Tab>
					<Tab value="binary">Binary</Tab>
					<Tab value="slice">Slice</Tab>
					<Tab value="dice">Dice</Tab>
					<Tab value="sliceDice">Slice / Dice</Tab>
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

<Preview>
	<Breadcrumb items={selectedZoomable?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selectedZoomable = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
    <div class="h-[600px] p-4 border rounded">
    	<Chart data={complexDataHierarchy.copy()}>
    		<Svg>
    			<Treemap {tile} bind:selected={selectedZoomable}>
						<Group slot="node" let:node let:rect x={rect.x} y={rect.y} on:click={() => node.children ? selectedZoomable = node : null}>
								<RectClipPath width={rect.width} height={rect.height}>
									{@const nodeColor = getNodeColor(node, colorBy)}
									{#if isVisible(node, selectedZoomable)}
										<g transition:fade={{ duration: 600 }}>
											<Rect
												width={rect.width}
												height={rect.height}
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
									{/if}
							</RectClipPath>
						</Group>
    			</Treemap>
    		</Svg>
    	</Chart>
    </div>
</Preview>
