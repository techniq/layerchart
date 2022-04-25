---
title: ['Charts', 'Sankey']
---

<script lang="ts">
	import { hierarchy } from 'd3-hierarchy';
	import { fade } from 'svelte/transition';

	import { Button, Breadcrumb, Field, Tabs, Tab } from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Group from '$lib/components/Group.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import Text from '$lib/components/Text.svelte';
	import Treemap from '$lib/components/Treemap.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { simpleData, complexData } from './data/hierarchy';

	const complexDataHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	let tile = 'squarify'

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
</script>

## Nested

<div class="grid grid-flow-col gap-4 mb-4">
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
				<Treemap {tile} bind:selected={selectedNested} paddingOuter={3} paddingTop={19} paddingInner={2} let:node let:rect>
					<g on:click={() => node.children ? selectedNested = node : null} transition:fade={{ duration: 600 }}>
						<Rect
							{...rect}
							stroke="white"
							fill={node.children ? "#ccc" : "#ddd"}
							rx={5}
						/>
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
					</g>
				</Treemap>
			</Svg>
		</Chart>
	</div>
</Preview>

## Zoomable

<div class="grid grid-flow-col gap-4 mb-4">
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
    			<Treemap {tile} bind:selected={selectedZoomable} let:node let:rect>
						{#if isVisible(node, selectedZoomable)}
							<g on:click={() => node.children ? selectedZoomable = node : null} transition:fade={{ duration: 600 }}>
								<Rect
									{...rect}
									stroke="white"
									fill={node.children ? "#ccc" : "#ddd"}
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
    			</Treemap>
    		</Svg>
    	</Chart>
    </div>
</Preview>
