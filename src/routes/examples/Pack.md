---
title: ['Charts', 'Pack']
---

<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { rollup } from 'd3-array'

	import { mdiArrowULeftTop, mdiChevronLeft, mdiChevronRight, mdiMagnifyPlusOutline, mdiMagnifyMinusOutline, mdiImageFilterCenterFocus } from '@mdi/js';

	import { Breadcrumb, Button, Field, Switch, Tabs, Tab, Tooltip } from 'svelte-ux';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Bounds from '$lib/components/Bounds.svelte';
	import ChartClipPath from '$lib/components/ChartClipPath.svelte';
	import Group from '$lib/components/Group.svelte';
	import Circle from '$lib/components/Circle.svelte';
	import CircleClipPath from '$lib/components/CircleClipPath.svelte';
	import Text from '$lib/components/Text.svelte';
	import Pack from '$lib/components/Pack.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	import { findAncestor } from '$lib/utils/hierarchy';

	import Preview from '$lib/docs/Preview.svelte';

	import { complexData } from './data/hierarchy';
	import carsCsv from './data/cars.csv'

	const complexHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	let colorBy = 'parent';

	let padding = 3;
	let selected;
	let zoom;

	$: if (zoom && selected) {
		zoom.zoomTo({ x: selected.x, y: selected.y }, { x: selected.r * 2, y: selected.r * 2 })
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

	onMount(() => {
		// Set root initially.  Wait for Tree to mount so layout is set
		selected = complexHierarchy; // select root initially
	})
</script>

<div class="grid grid-flow-col gap-4 mb-4">
	<div class="grid grid-cols-[2fr,1fr,1fr] gap-2">
		<Field label="Padding" let:id>
			<Button icon={mdiChevronLeft} on:click={() => padding -= 1} class="mr-2" />
			<input type="range" bind:value={padding} min={0} max={50} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{padding}</span>
			<Button icon={mdiChevronRight} on:click={() => padding += 1} class="ml-2" />
		</Field>
		<Field label="Color By">
			<Tabs bind:selected={colorBy} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value="parent">Parent</Tab>
					<Tab value="depth">Depth</Tab>
				</div>
			</Tabs>
		</Field>
	</div>
</div>

## General

<Preview>
	<Breadcrumb items={selected?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selected = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[600px] p-4 border rounded relative overflow-hidden">
		<div class="absolute top-0 right-0 z-10">
			<div class="bg-black/5 rounded-full m-1 backdrop-blur">
				<Tooltip title="Zoom in">
					<Button icon={mdiMagnifyPlusOutline} on:click={() => zoom.increase()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Zoom out">
					<Button icon={mdiMagnifyMinusOutline} on:click={() => zoom.decrease()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Center">
					<Button icon={mdiImageFilterCenterFocus} on:click={() => zoom.translateCenter()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Reset">
					<Button icon={mdiArrowULeftTop} on:click={() => zoom.reset()} class="text-black/50 p-2" />
				</Tooltip>
			</div>
		</div>
		<Chart data={complexHierarchy}>
			<Svg>
				<Zoom bind:this={zoom} let:scale tweened={{ duration: 800, easing: cubicOut }}>
						<Pack {padding} let:nodes>
							{#each nodes as node}
								<Group x={node.x} y={node.y} on:click={() => selected = node} class="cursor-pointer hover:contrast-[1.2]">
									{@const nodeColor = getNodeColor(node, colorBy)}
									<Circle
										r={node.r}
										stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
										fill={nodeColor}
										rx={5}
									/>
								</Group>
							{/each}
							<!-- Show text on top of all circles -->
							{#each selected ? (selected.children ?? [selected]) : [] as node (node.data.name + node.depth)}
								{@const fontSize = 1 / scale.x}
								<g in:fade|local>
									<text
										x={node.x}
										y={node.y}
										dy={fontSize * 8}
										style="font-size: {fontSize}rem; text-anchor: middle; pointer-events: none;"
									>
										{node.data.name}
									</text>
								</g>
							{/each}
						</Pack>
				</Zoom>
			</Svg>
		</Chart>
	</div>
</Preview>
