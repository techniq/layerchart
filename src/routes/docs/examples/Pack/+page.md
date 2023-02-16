---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import { Breadcrumb, Button, Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { format } from 'svelte-ux/utils/format';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Group from '$lib/components/Group.svelte';
	import Circle from '$lib/components/Circle.svelte';
	import Pack from '$lib/components/Pack.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	import { findAncestor } from '$lib/utils/hierarchy';

	import Preview from '$lib/docs/Preview.svelte';

	import { complexData } from '../_data/hierarchy';

	const complexHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	let colorBy = 'parent';

	let padding = 3;
	let selected;
	let zoom;

	$: if (zoom && selected) {
		zoom.zoomTo({ x: selected.x, y: selected.y }, selected.r * 2)
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
			<ToggleGroup bind:value={colorBy} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="parent">Parent</ToggleOption>
				<ToggleOption value="depth">Depth</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>
</div>

## General

<Preview>
	<Breadcrumb items={selected?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selected = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{format(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[600px] p-4 border rounded overflow-hidden">
		<Chart data={complexHierarchy}>
			<Svg>
				<Zoom bind:this={zoom} let:scale tweened={{ duration: 800, easing: cubicOut }} disablePointer on:click={() => selected = complexHierarchy}>
						<Pack {padding} let:nodes>
							{#each nodes as node}
								<Group x={node.x} y={node.y} on:click={(e) => { e.stopPropagation(); selected = node }} class="cursor-pointer hover:contrast-[1.2]">
									{@const nodeColor = getNodeColor(node, colorBy)}
									<Circle
										r={node.r}
										stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
										stroke-width={1 / scale}
										fill={nodeColor}
										rx={5}
									/>
								</Group>
							{/each}
							<!-- Show text on top of all circles -->
							{#each selected ? (selected.children ?? [selected]) : [] as node (node.data.name + node.depth)}
								{@const fontSize = 1 / scale}
								<g in:fade|local>
									<text
										x={node.x}
										y={node.y}
										dy={fontSize * 8}
										class="stroke-white/70"
										style="font-size: {fontSize}rem; text-anchor: middle; pointer-events: none; paint-order: stroke; stroke-width: {fontSize * 2}px"
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
