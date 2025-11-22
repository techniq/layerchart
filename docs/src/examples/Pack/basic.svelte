<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy, type HierarchyCircularNode, type HierarchyNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';

	import {
		Chart,
		Circle,
		Group,
		Pack,
		Layer,
		Text,
		findAncestor,
		type ChartContextValue
	} from 'layerchart';
	import { Breadcrumb, Button } from 'svelte-ux';
	import { format, sortFunc } from '@layerstack/utils';
	import PackControls from '$lib/components/controls/PackControls.svelte';
	import { getFlare } from '$lib/data.remote';

	let colorBy: 'depth' | 'parent' | 'children' = $state('parent');
	let padding = $state(3);
	let nodes = $state.raw<HierarchyCircularNode<any>[]>([]);
	let selected = $state.raw<HierarchyCircularNode<any>>();
	let context = $state<ChartContextValue>(null!);

	// Move until https://github.com/sveltejs/svelte/issues/17090 is resolved
	let data = await getFlare();

	const complexHierarchy = hierarchy(data)
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc')) as HierarchyCircularNode<any>;

	$effect(() => {
		if (context?.transform && selected) {
			const node = findSelectedNodeInHierarchy(selected, nodes);
			const diameter = node.r * 2;
			context.transform.zoomTo({ x: node.x, y: node.y }, { width: diameter, height: diameter });
		}
	});

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	// filter out hard to see yellow and green
	const ordinalColor = scaleOrdinal(
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
	);
	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

	function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
		switch (colorBy) {
			case 'children':
				return node.children ? '#ccc' : '#ddd';
			case 'depth':
				return sequentialColor(node.depth).toString();
			case 'parent':
				const colorParent = findAncestor(node, (n) => n.depth === 1);
				return colorParent
					? hsl(ordinalColor(colorParent.data.name))
							.brighter(node.depth * 0.3)
							.toString()
					: '#ddd';
		}
		return '';
	}

	function findSelectedNodeInHierarchy(
		selectedNode: HierarchyCircularNode<any>,
		hierarchy: HierarchyCircularNode<any>[]
	): HierarchyCircularNode<any> {
		for (const node of hierarchy) {
			if (node.data.name === selectedNode.data.name) {
				return node;
			}
		}
		return selectedNode;
	}
</script>

<PackControls bind:padding bind:colorBy />

<Breadcrumb
	items={selected ? selected?.ancestors().reverse() : (nodes[0]?.ancestors().reverse() ?? [])}
	class="mb-2"
>
	<Button slot="item" let:item on:click={() => (selected = item)} base class="px-2 py-1 rounded-sm">
		<div class="text-left">
			<div class="text-sm">{item.data.name}</div>
			<div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
		</div>
	</Button>
</Breadcrumb>

<Chart
	transform={{
		mode: 'canvas',
		disablePointer: true,
		motion: { type: 'tween', duration: 800, easing: cubicOut }
	}}
	bind:context
	height={600}
	class="overflow-hidden"
>
	<Layer onclick={() => (selected = complexHierarchy)}>
		<Pack {padding} hierarchy={complexHierarchy} bind:nodes>
			{#each nodes as node ([node.data.name, node.parent?.data.name].join('-'))}
				<Group
					x={node.x}
					y={node.y}
					onclick={(e) => {
						e.stopPropagation();
						selected = node;
					}}
					class="cursor-pointer hover:contrast-[1.2]"
				>
					{@const nodeColor = getNodeColor(node, colorBy)}
					<Circle
						r={node.r}
						stroke={hsl(nodeColor)
							.darker(colorBy === 'children' ? 0.5 : 1)
							.toString()}
						strokeWidth={1 / context.transform.scale}
						fill={nodeColor}
					/>
				</Group>
			{/each}

			{@const selectedNodes = selected
				? (selected.children ?? [selected])
				: nodes[0]
					? (nodes[0].children ?? [nodes[0]])
					: []}

			{#each selectedNodes as node ([node.data.name, node.parent?.data.name].join('-'))}
				{@const trueNode = findSelectedNodeInHierarchy(node, nodes)}
				{@const fontSize = 1 / context.transform.scale}
				<g in:fade|local>
					<Text
						value={trueNode.data.name}
						x={trueNode.x}
						y={trueNode.y}
						dy={fontSize * 8}
						style="font-size: {fontSize}rem; stroke-width: {fontSize * 2}px"
						class="fill-black stroke-white/70 pointer-events-none [text-anchor:middle] [paint-order:stroke]"
					/>
				</g>
			{/each}
		</Pack>
	</Layer>
</Chart>
